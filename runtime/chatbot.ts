import { cleanEnv, json, num, str, url } from 'envalid';
import { schedule } from 'node-cron';
import { io, Socket } from 'socket.io-client';
import { Handle } from './handle';
import { handleAssign } from './handle-assign';
import { handleAssignTag } from './handle-assign-tag';
import { handleBranch } from './handle-branch';
import { handleButtons } from './handle-buttons';
import { handleClose } from './handle-close';
import { handleCollectInput } from './handle-collect-input';
import { handleSendMessage } from './handle-send-message';
import { handleServiceCall } from './handle-service-call';
import { handleStart } from './handle-start';
import { checkStart, findStart, initializeVariables } from './helpers';
import { Queue } from './queue';
import {
  AssigneeType,
  Chat,
  EventType,
  Message,
  NodeType,
  Schema,
  Session,
} from './types';

export class Chatbot {
  private schema: Schema;
  private id: number;
  private ws: string;
  private token: string;
  private io: Socket;
  private sessions: Record<number, Session> = {};
  private cron: {
    [nodeId: string]: {
      cron: string;
      sessions: Record<number, Session>;
    };
  };

  private handlers: Record<NodeType, Handle<any>> = {
    [NodeType.AssignTag]: handleAssignTag,
    [NodeType.Assign]: handleAssign,
    [NodeType.Branch]: handleBranch,
    [NodeType.Buttons]: handleButtons,
    [NodeType.Close]: handleClose,
    [NodeType.CollectInput]: handleCollectInput,
    [NodeType.SendMessage]: handleSendMessage,
    [NodeType.ServiceCall]: handleServiceCall,
    [NodeType.Start]: handleStart,
  };

  constructor() {
    Object.assign(
      this,
      cleanEnv(process.env, {
        schema: json(),
        id: num(),
        ws: url(),
        token: str(),
        cron: json({
          default: {},
        }),
      }),
    );

    this.io = io(this.ws, {
      auth: {
        token: this.token,
      },
    });

    this.io.on(EventType.NewChat, this.handleNewChat.bind(this));
    this.io.on(EventType.Message, this.handleMessage.bind(this));
  }

  start(): void {
    Object.entries(this.cron).flatMap(([id, { cron }]) => {
      schedule(cron, () => {
        Object.values(this.cron[id].sessions).map((session) =>
          this.next(session.chat.contact.id),
        );

        this.cron[id].sessions = {};
      });
    });

    console.log(`Chatbot ${this.id} started`);
  }

  private async handleNewChat(chat: Chat): Promise<void> {
    if (chat.messages.some(({ fromMe }) => fromMe)) {
      return;
    }

    if (!this.sessions[chat.contact.id]) {
      const node = findStart(this.schema);

      if (!checkStart(node.trigger, chat)) {
        return;
      }

      this.sessions[chat.contact.id] = {
        chat,
        node,
        variables: initializeVariables(this.schema),
        queue: new Queue(),
      };

      await this.io.emitWithAck(EventType.UpdateContact, {
        id: chat.contact.id,
        assignedTo: {
          id: this.id,
          type: AssigneeType.Chatbot,
        },
      });
    }

    const session = this.sessions[chat.contact.id];
    if (session?.node) {
      const handle = this.handlers[session.node.type](
        this.schema,
        this.sessions,
        this.io,
        () => this.next(session.chat.contact.id),
      );

      session.queue.push(() => handle(session.chat, session.node));
    }
  }

  private async handleMessage(message: Message): Promise<void> {
    // TODO
  }

  private next(contactId: number): void {
    const session = this.sessions[contactId];
    if (session?.node) {
      const handle = this.handlers[session.node.type](
        this.schema,
        this.sessions,
        this.io,
        () => this.next(session.chat.contact.id),
      );

      session.queue.unshift(() => handle(session.chat, session.node));
    } else {
      delete this.sessions[contactId];
    }
  }
}
