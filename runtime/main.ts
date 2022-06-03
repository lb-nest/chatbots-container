// @ts-ignore
import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

declare const Deno: Record<string, any>;

class ConfigByEnvironment {
  [key: string]: any;

  constructor() {
    Object.assign(this, Deno.env.toObject());
  }
}

export enum AttachmentType {
  Audio = 'Audio',
  Document = 'Document',
  Image = 'Image',
  Video = 'Video',
}

interface Attachment {
  type: AttachmentType;
  url: string;
  name?: string;
}

enum ButtonType {
  QuickReply = 'QuickReply',
}

interface Button {
  type: ButtonType;
  text: string;
  next?: string;
}

enum NodeType {
  Start = 'Start',
  SendMessage = 'SendMessage',
  CollectInput = 'CollectInput',
  Buttons = 'Buttons',
  Branch = 'Branch',
  ServiceCall = 'ServiceCall',
  Transfer = 'Transfer',
  AssignTag = 'AssignTag',
  Close = 'Close',
}

interface NodeBase<T extends NodeType> {
  id: string;
  type: T;
}

enum TriggerType {
  NewChat = 'NewChat',
  NewAssignment = 'NewAssignment',
}

interface Start extends NodeBase<NodeType.Start> {
  trigger: TriggerType;
  next?: string;
}

interface SendMessage extends NodeBase<NodeType.SendMessage> {
  text: string;
  attachments: Attachment[];
  next?: string;
}

enum ValidationType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Email = 'Email',
  Phone = 'Phone',
  Regex = 'Regex',
}

interface CollectInput extends NodeBase<NodeType.CollectInput> {
  text: string;
  variable: string;
  validation: ValidationType;
  next?: string;
}

interface Buttons extends NodeBase<NodeType.Buttons> {
  text: string;
  buttons: Button[];
}

enum OperatorType {
  Eq = 'Eq',
  Neq = 'Neq',
  Lt = 'Lt',
  Lte = 'Lte',
  Gt = 'Gt',
  Gte = 'Gte',
}

interface Condition {
  variable1: string;
  operator: OperatorType;
  variable2: string;
}

enum ComparsionType {
  All = 'All',
  Any = 'Any',
}

interface BranchItem {
  type: ComparsionType;
  conditions: Condition[];
  next?: string;
}

interface Branch extends NodeBase<NodeType.Branch> {
  branches: BranchItem[];
  default?: string;
}

interface Request {
  url: string;
  headers: Record<string, string>;
  body?: any;
}

interface ServiceCall extends NodeBase<NodeType.ServiceCall> {
  request: Request;
  response: Record<number, any>;
  next?: string;
  error?: string;
}

interface Transfer extends NodeBase<NodeType.Transfer> {
  assignedTo: number | null;
  next?: string;
}

interface AssignTag extends NodeBase<NodeType.AssignTag> {
  tag: number;
  next?: string;
}

interface Close extends NodeBase<NodeType.Close> {
  next?: string;
}

type Node =
  | Start
  | SendMessage
  | CollectInput
  | Buttons
  | Branch
  | ServiceCall
  | Transfer
  | AssignTag
  | Close;

enum VariableType {
  String = 'String',
}

interface Variable {
  id: string;
  type: VariableType;
  name: string;
  value?: any;
}

interface Schema {
  nodes: Record<string, Node>;
  variables: Variable[];
}

interface Chat {
  [key: string]: any;
}

class Queue {
  private fn: Function[] = [];
  private lock = false;

  [Symbol.asyncIterator]() {
    return {
      next: async () => {
        const fn = this.fn.shift();
        return {
          done: fn === undefined,
          value: fn,
        };
      },
    };
  }

  async push(fn: Function): Promise<void> {
    this.fn.push(fn);
    if (!this.lock) {
      await this.execute();
    }
  }

  async unshift(fn: Function): Promise<void> {
    this.fn.unshift(fn);
    if (!this.lock) {
      await this.execute();
    }
  }

  private async execute(): Promise<void> {
    this.lock = true;

    for await (const fn of this) {
      await fn();
    }

    this.lock = false;
  }
}

interface Session {
  chat: Chat;
  node: Node;
  variables: Record<string, Variable>;
  wait?: boolean;
}

export enum EventType {
  NewEvent = 'NewEvent',
  Callback = 'Callback',
  SendMessage = 'SendMessage',
  Transfer = 'Transfer',
  AssignTag = 'AssignTag',
  Close = 'Close',
}

class Chatbot {
  private schema: Schema;
  private session: Record<number, Session> = {};
  private io: any;

  private queue = new Queue();

  private handlers: Record<NodeType, Function> = {
    [NodeType.Start]: this.handleStart.bind(this),
    [NodeType.SendMessage]: this.handleSendMessage.bind(this),
    [NodeType.CollectInput]: this.handleCollectInput.bind(this),
    [NodeType.Buttons]: this.handleButtons,
    [NodeType.Branch]: this.handleBranch.bind(this),
    [NodeType.ServiceCall]: this.handleServiceCall.bind(this),
    [NodeType.Transfer]: this.handleTransfer.bind(this),
    [NodeType.AssignTag]: this.handleAssignTag.bind(this),
    [NodeType.Close]: this.handleClose.bind(this),
  };

  constructor(private config: ConfigByEnvironment) {
    this.schema = JSON.parse(config.schema);
    this.io = io(config.ws, {
      transports: ['websocket'],
      auth: {
        token: config.token,
      },
    });

    this.io.on(EventType.NewEvent, this.handleNewEvent.bind(this));
    this.io.on(EventType.Callback, this.handleCallback.bind(this));
  }

  start(): void {}

  private handleCallback(chat: Chat): void {
    this.queue.unshift(() => {
      const session = this.session[chat.id];
      this.handlers[session.node?.type]?.(session.chat, session.node);
    });
  }

  private handleNewEvent(chat: Chat): void {
    this.queue.push(() => {
      if (this.session[chat.id] === undefined) {
        const node = this.getStart();
        if (this.check(node.trigger, chat)) {
          this.session[chat.id] = {
            chat,
            node,
            variables: this.getVariables(),
          };
        }
      }

      const session = this.session[chat.id];
      this.handlers[session.node?.type]?.(session.chat, session.node);
    });
  }

  private handleStart(chat: Chat, node: Start): void {
    this.io.emit(EventType.Callback, {
      chatId: chat.id,
    });
    this.session[chat.id].node = this.schema.nodes[node.next as any];
  }

  private handleSendMessage(chat: Chat, node: SendMessage): void {
    this.io.emit(EventType.SendMessage, {
      chatId: chat.id,
      text: node.text,
      attachments: node.attachments,
    });
    this.session[chat.id].node = this.schema.nodes[node.next as any];
  }

  private handleCollectInput(chat: Chat, node: CollectInput): void {
    if (this.session[chat.id].wait) {
      // TODO: сохранение в переменную, отправка события что все ок
    } else {
      this.io.emit(EventType.SendMessage, {
        chatId: chat.id,
        text: node.text,
      });
      this.session[chat.id].wait = true;
    }
  }

  private handleButtons(chat: Chat, node: Buttons): void {
    if (this.session[chat.id].wait) {
      // TODO: получить какую кнопку нажал пользователь. Перейти на ноду, закрепленную за этой кнопкой
    } else {
      this.io.emit(EventType.SendMessage, {
        chatId: chat.id,
        text: node.text,
        buttons: node.buttons,
      });
      this.session[chat.id].wait = true;
    }
  }

  private handleBranch(chat: Chat, node: Node): void {
    // TODO: найти подходящее условие и перейти на ноду, закрепенную за этим усовием
    this.io.emit(EventType.Callback, {
      chatId: chat.id,
    });
  }

  private handleServiceCall(chat: Chat, node: Node): void {
    // TODO: вызвать внешний api, перейти на следующую ноду
    this.io.emit(EventType.Callback, {
      chatId: chat.id,
    });
  }

  private handleTransfer(chat: Chat, node: Transfer): void {
    this.io.emit(EventType.Transfer, {
      chatId: chat.id,
      assignedTo: node.assignedTo,
    });
    this.session[chat.id].node = this.schema.nodes[node.next as any];
  }

  private handleAssignTag(chat: Chat, node: AssignTag): void {
    this.io.emit(EventType.AssignTag, {
      chatId: chat.id,
      tag: node.tag,
    });
    this.session[chat.id].node = this.schema.nodes[node.next as any];
  }

  private handleClose(chat: Chat, node: Close): void {
    this.io.emit(EventType.Close, {
      chatId: chat.id,
    });
    this.session[chat.id].node = this.schema.nodes[node.next as any];
  }

  private getStart(): Start {
    return <Start>Object.values(this.schema.nodes).find(({ type }) => type === NodeType.Start);
  }

  private getVariables(): Record<string, Variable> {
    return Object.fromEntries(this.schema.variables.map((variable) => [variable.id, variable]));
  }

  private check(trigger: TriggerType, chat: Chat): boolean {
    switch (trigger) {
      case TriggerType.NewAssignment:
        return chat.isFlow && chat.contact.assignedTo?.id === this.config.id;

      case TriggerType.NewChat:
        return chat.isNew;

      default:
        throw new Error();
    }
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
