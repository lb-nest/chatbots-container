// @ts-ignore
import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

declare const Deno: Record<string, any>;

class ConfigByEnvironment {
  [key: string]: any;

  get<T = any>(key: string): T {
    return this[key];
  }

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
  Url = 'Url',
  Phone = 'Phone',
}

interface Button {
  type: ButtonType;
  text: string;
  url?: string;
  phone?: string;
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
  RegExp = 'RegExp',
}

interface CollectInput extends NodeBase<NodeType.CollectInput> {
  text: string;
  variable: string;
  validation: ValidationType;
  regexp?: string;
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
  Any = 'Any',
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

enum ContactStatus {
  Open = 'Open',
  Closed = 'Closed',
}

interface Tag {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactTag {
  tag: Tag;
}

interface Contact {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  status: ContactStatus;
  assignedTo?: any;
  notes: string;
  priority: boolean;
  resolved: boolean;
  tags: ContactTag[];
}

enum MessageStatus {
  Submitted = 'Submitted',
  Delivered = 'Delivered',
  Read = 'Read',
  Failed = 'Failed',
}

interface Message {
  id: number;
  fromMe: boolean;
  status: MessageStatus;
  content: Array<{
    text: string | null;
    attachments: Attachment[];
    buttons: Array<Omit<Button, 'next'>>;
  }>;
  createdAt: string;
  updatedAt: string;
  chat?: {
    id: number;
  };
}

interface Chat {
  id: number;
  contact: Contact;
  messages: Array<Omit<Message, 'chat'>>;
  isNew: boolean;
  isFlow?: boolean;
}

interface ValidationOptions {
  regexp?: string;
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
      await fn?.();
    }

    this.lock = false;
  }
}

interface Session {
  chat: Chat;
  node: Node;
  variables: Record<string, Variable>;
  queue: Queue;
  wait?: boolean;
}

export enum EventType {
  NewChat = 'NewChat',
  Message = 'Message',
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

    this.io.on(EventType.NewChat, this.handleNewChat.bind(this));
    this.io.on(EventType.Message, this.handleMessage.bind(this));
    this.io.on(EventType.Callback, this.handleCallback.bind(this));
  }

  start(): void {}

  private handleNewChat(chat: Chat): void {
    if (this.session[chat.id] === undefined) {
      const node = this.findStart();

      if (!this.check(node.trigger, chat)) {
        return;
      }

      this.session[chat.id] = {
        chat,
        node,
        variables: this.initializeVariables(),
        queue: new Queue(),
      };
    }

    const session = this.session[chat.id];
    session.queue.push(() => this.handlers[session.node?.type]?.(session.chat, session.node));
  }

  private handleMessage(message: Required<Message>): void {
    if (this.session[message.chat.id] === undefined) {
      return;
    }

    // TODO: handle message
  }

  private handleCallback(chat: Chat): void {
    const session = this.session[chat.id];
    if (session) {
      session.queue.unshift(() => this.handlers[session.node?.type]?.(session.chat, session.node));
    }
  }

  private handleStart(chat: Chat, node: Start): void {
    this.session[chat.id].node = this.schema.nodes[<any>node.next];
    this.io.emit(EventType.Callback, {
      chatId: chat.id,
    });
  }

  private handleSendMessage(chat: Chat, node: SendMessage): void {
    this.session[chat.id].node = this.schema.nodes[<any>node.next];
    this.io.emit(EventType.SendMessage, {
      chatId: chat.id,
      text: node.text,
      attachments: node.attachments,
    });
  }

  private handleCollectInput(chat: Chat, node: CollectInput): void {
    const session = this.session[chat.id];
    if (session.wait) {
      const [{ text }] = chat.messages[0].content;

      if (this.validate(node.validation, text, node)) {
        session.variables[node.variable].value = text;
        session.node = this.schema.nodes[<any>node.next];
      }

      this.io.emit(EventType.Callback, {
        chatId: chat.id,
      });
    } else {
      session.wait = true;
      this.io.emit(EventType.SendMessage, {
        chatId: chat.id,
        text: node.text,
      });
    }
  }

  private handleButtons(chat: Chat, node: Buttons): void {
    const session = this.session[chat.id];
    if (session.wait) {
      const button = node.buttons
        .filter(({ type }) => type === ButtonType.QuickReply)
        .find(({ text }) => text === chat.messages[0].content[0].text);

      if (button) {
        this.session[chat.id].node = this.schema.nodes[<any>button.next];
      }

      this.io.emit(EventType.Callback, {
        chatId: chat.id,
      });
    } else {
      this.session[chat.id].wait = true;
      this.io.emit(EventType.SendMessage, {
        chatId: chat.id,
        text: node.text,
        buttons: node.buttons,
      });
    }
  }

  private handleBranch(chat: Chat, node: Branch): void {
    const session = this.session[chat.id];
    const branch = node.branches.find((branch) =>
      ({
        [ComparsionType.All]: (a: boolean[]) => a.every(Boolean),
        [ComparsionType.Any]: (a: boolean[]) => a.some(Boolean),
      }[branch.type](
        branch.conditions.map((condition) =>
          ({
            [OperatorType.Eq]: (a: any, b: any) => a === b,
            [OperatorType.Gt]: (a: any, b: any) => a > b,
            [OperatorType.Gte]: (a: any, b: any) => a >= b,
            [OperatorType.Lt]: (a: any, b: any) => a < b,
            [OperatorType.Lte]: (a: any, b: any) => a <= b,
            [OperatorType.Neq]: (a: any, b: any) => a !== b,
          }[condition.operator](
            session.variables[condition.variable1],
            session.variables[condition.variable2],
          )),
        ),
      )),
    );

    if (branch) {
      this.session[chat.id].node = this.schema.nodes[<any>branch.next];
    } else {
      this.session[chat.id].node = this.schema.nodes[<any>node.default];
    }

    this.io.emit(EventType.Callback, {
      chatId: chat.id,
    });
  }

  private handleServiceCall(chat: Chat, node: ServiceCall): void {
    fetch(node.request.url, {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
        },
        node.request.headers,
      ),
      body: JSON.stringify(node.request.body),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }

        this.session[chat.id].node = this.schema.nodes[<any>node.next];
      })
      .catch(() => {
        this.session[chat.id].node = this.schema.nodes[<any>node.error];
      })
      .finally(() => {
        this.io.emit(EventType.Callback, {
          chatId: chat.id,
        });
      });
  }

  private handleTransfer(chat: Chat, node: Transfer): void {
    this.session[chat.id].node = this.schema.nodes[<any>node.next];
    this.io.emit(EventType.Transfer, {
      chatId: chat.id,
      assignedTo: node.assignedTo,
    });
  }

  private handleAssignTag(chat: Chat, node: AssignTag): void {
    this.session[chat.id].node = this.schema.nodes[<any>node.next];
    this.io.emit(EventType.AssignTag, {
      chatId: chat.id,
      tag: node.tag,
    });
  }

  private handleClose(chat: Chat, node: Close): void {
    this.session[chat.id].node = this.schema.nodes[<any>node.next];
    this.io.emit(EventType.Close, {
      chatId: chat.id,
    });
  }

  private findStart(): Start {
    return <Start>Object.values(this.schema.nodes).find(({ type }) => type === NodeType.Start);
  }

  private initializeVariables(): Record<string, Variable> {
    return Object.fromEntries(this.schema.variables.map((variable) => [variable.id, variable]));
  }

  private check(trigger: TriggerType, chat: Chat): boolean {
    switch (trigger) {
      case TriggerType.NewChat:
        return chat.isNew;

      default:
        throw new Error();
    }
  }

  private validate(validation: ValidationType, text: any, options?: ValidationOptions): boolean {
    switch (validation) {
      case ValidationType.Boolean:
        return typeof text === 'boolean';

      case ValidationType.Email:
        return true;

      case ValidationType.Number:
        return typeof text === 'number';

      case ValidationType.Phone:
        return true;

      case ValidationType.RegExp:
        return typeof options?.regexp === 'string' && new RegExp(options?.regexp).test(text);

      case ValidationType.String:
        return typeof text === 'string';
    }
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
