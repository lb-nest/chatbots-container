import { Queue } from './queue';

export interface NodeNext {
  next?: string;
}

export interface NodeError {
  error?: string;
}

export enum AttachmentType {
  Audio = 'Audio',
  Document = 'Document',
  Image = 'Image',
  Video = 'Video',
}

export interface Attachment {
  type: AttachmentType;
  url: string;
  name?: string;
}

export enum ButtonType {
  QuickReply = 'QuickReply',
  Url = 'Url',
  Phone = 'Phone',
}

export interface Button extends NodeNext {
  type: ButtonType;
  text: string;
  url?: string;
  phone?: string;
}

export enum NodeType {
  Start = 'Start',
  SendMessage = 'SendMessage',
  CollectInput = 'CollectInput',
  Buttons = 'Buttons',
  Branch = 'Branch',
  ServiceCall = 'ServiceCall',
  Assign = 'Assign',
  AssignTag = 'AssignTag',
  Close = 'Close',
}

export interface NodeBase<T extends NodeType> {
  id: string;
  type: T;
}

export enum TriggerType {
  NewChat = 'NewChat',
  Webhook = 'Webhook',
}

export interface Start extends NodeNext, NodeBase<NodeType.Start> {
  trigger: TriggerType;
}

export interface SendMessage extends NodeNext, NodeBase<NodeType.SendMessage> {
  text: string;
  attachments: Attachment[];
}

export enum ValidationType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Email = 'Email',
  Phone = 'Phone',
  RegExp = 'RegExp',
}

export interface ValidationOptions {
  regexp?: string;
}

export interface CollectInput
  extends NodeNext,
    NodeBase<NodeType.CollectInput> {
  text: string;
  variable: string;
  validation: ValidationType;
  regexp?: string;
}

export interface Buttons extends NodeBase<NodeType.Buttons> {
  text: string;
  buttons: Button[];
}

export enum OperatorType {
  Eq = 'Eq',
  Neq = 'Neq',
  Lt = 'Lt',
  Lte = 'Lte',
  Gt = 'Gt',
  Gte = 'Gte',
  Includes = 'Includes',
  StartsWith = 'StartsWith',
  EndsWith = 'EndsWith',
}

export interface Condition {
  variable1: string;
  operator: OperatorType;
  variable2: string;
}

export enum ComparisonType {
  All = 'All',
  Any = 'Any',
}

export interface BranchItem extends NodeNext {
  type: ComparisonType;
  conditions: Condition[];
}

export interface Branch extends NodeBase<NodeType.Branch> {
  branches: BranchItem[];
  default?: string;
}

export interface ServiceCall
  extends NodeNext,
    NodeError,
    NodeBase<NodeType.ServiceCall> {
  method?: string;
  url: string;
  headers: Record<string, string>;
  data?: any;
  variable?: string;
}

export enum AssigneeType {
  User = 'User',
  Chatbot = 'Chatbot',
}

export interface Assign extends NodeNext, NodeBase<NodeType.Assign> {
  assignedTo: {
    id: number;
    type: AssigneeType;
  } | null;
}

export interface AssignTag extends NodeNext, NodeBase<NodeType.AssignTag> {
  tagId: number;
}

export interface Close extends NodeNext, NodeBase<NodeType.Close> {}

export type Node =
  | Start
  | SendMessage
  | CollectInput
  | Buttons
  | Branch
  | ServiceCall
  | Assign
  | AssignTag
  | Close;

export enum VariableType {
  Any = 'Any',
}

export interface Variable {
  name: string;
  type: VariableType;
  value?: any;
}

export interface Schema {
  nodes: Record<string, Node>;
  variables: Variable[];
}

export interface Tag {
  id: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export enum ContactStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export interface Contact {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  status: ContactStatus;
  assignedTo?: any;
  notes: string;
  priority: boolean;
  resolved: boolean;
  tags: Array<{
    tag: Tag;
  }>;
}

export enum MessageStatus {
  Submitted = 'Submitted',
  Delivered = 'Delivered',
  Read = 'Read',
  Failed = 'Failed',
}

export interface Message {
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
}

export interface Chat {
  channelId: number;
  accountId: string;
  contact: Contact;
  messages: Array<Omit<Message, 'chat'>>;
  isNew: boolean;
  // isFlow?: boolean;
}

export interface Callback {
  contactId: number;
}

export interface Session {
  chat: Chat;
  node: Node;
  variables: Record<string, Variable>;
  queue: Queue;
  wait?: boolean;
}

export enum EventType {
  NewChat = 'NewChat',
  Message = 'Message',
  CreateMessage = 'CreateMessage',
  UpdateContact = 'UpdateContact',
}
