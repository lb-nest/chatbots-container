// @ts-ignore
import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';
// @ts-ignore
import Queue from 'https://deno.land/x/queue/mod.ts';

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

interface Session {
  chat: Chat;
  node: Node;
  variables: Record<string, Variable>;
}

export enum ChatbotEventType {
  NewAssignment = 'NewAssignment',
  NewMessage = 'NewMessage',
  SetTag = 'SetTag',
  TransferContact = 'TransferContact',
  CloseContact = 'CloseContact',
}

class Chatbot {
  private schema: Schema;
  private session: Record<number, Session> = {};
  private io: any;

  private queue = new Queue();

  constructor(private config: ConfigByEnvironment) {
    this.schema = JSON.parse(config.schema);
    this.io = io(config.ws, {
      transports: ['websocket'],
      auth: {
        token: config.token,
        trigger: this.getStartNode()?.trigger,
      },
    });

    this.io.on(ChatbotEventType.NewAssignment, this.handleNewAssignment.bind(this));
    this.io.on(ChatbotEventType.NewMessage, this.handleNewMessage.bind(this));
  }

  start(): void {}

  private handleNewAssignment(chat: Chat): void {
    this.queue.push(() => {
      if (!this.session[chat.id]) {
        this.session[chat.id] = {
          chat,
          node: this.getStartNode(),
          variables: Object.fromEntries(
            this.schema.variables.map((variable) => [variable.id, variable]),
          ),
        };
      }
    });
  }

  private handleNewMessage(chat: Chat): void {
    this.queue.push(() => {
      const session = this.session[chat.id];

      switch (session.node.type) {
        case NodeType.Start:
          session.node = this.schema.nodes[session.node.next as any];
          break;

        case NodeType.SendMessage:
          console.log(1);

          break;

        case NodeType.CollectInput:
          break;

        case NodeType.Buttons:
          break;

        case NodeType.Branch:
          break;

        case NodeType.ServiceCall:
          break;

        case NodeType.Transfer:
          break;

        case NodeType.AssignTag:
          break;

        case NodeType.Close:
          break;
      }
    });
  }

  private getStartNode(): any {
    return Object.values(this.schema.nodes).find((node: any) => node.type === 'Start');
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
