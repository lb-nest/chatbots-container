import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum NodeType {
  Start = 'Start',
  SendMessage = 'SendMessage',
  CollectInput = 'CollectInput',
  Buttons = 'Buttons',
  Branch = 'Branch',
  ServiceCall = 'ServiceCall',
  Transfer = 'Transfer',
  Close = 'Close',
}

export class NodeBase<T extends NodeType> {
  @IsInt()
  id: number;

  @IsEnum(NodeType)
  type: T;

  @IsString()
  name: string;
}

export enum TriggerType {
  NewChat = 'NewChat',
  NewAssignment = 'NewAssignment',
}

export class Start extends NodeBase<NodeType.Start> {
  @IsEnum(TriggerType)
  trigger: TriggerType;

  @IsOptional()
  @IsInt()
  next?: number;
}

export class SendMessage extends NodeBase<NodeType.SendMessage> {
  @IsString()
  text: string;

  @Type(() => Object)
  @IsArray()
  @ValidateNested()
  attachments: Array<{
    type: 'Audio' | 'Document' | 'Image' | 'Video';
    url: string;
    name?: string;
  }>;

  @IsInt()
  next?: number;
}

export enum ValidationType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Email = 'Email',
  Phone = 'Phone',
  Regex = 'Regex',
}

export class CollectInput extends NodeBase<NodeType.CollectInput> {
  @IsString()
  text: string;

  @IsInt()
  variable: number;

  @IsEnum(ValidationType)
  validation: ValidationType;

  @IsOptional()
  @IsInt()
  next?: number;
}

export enum ButtonType {
  QuickReply = 'QuickReply',
}

export class Button {
  @IsEnum(ButtonType)
  type: ButtonType;

  @IsString()
  text: string;

  @IsOptional()
  @IsInt()
  next?: number;
}

export class Buttons extends NodeBase<NodeType.Buttons> {
  @IsString()
  text: string;

  @Type(() => Button)
  @IsArray()
  @ValidateNested()
  buttons: Button[];
}

export enum OperatorType {
  Eq = 'Eq',
  Neq = 'Neq',
  Lt = 'Lt',
  Lte = 'Lte',
  Gt = 'Gt',
  Gte = 'Gte',
}

export class Condition {
  @IsInt()
  variable1: number;

  @IsEnum(OperatorType)
  operator: OperatorType;

  @IsInt()
  variable2: number;
}

export enum ComparsionType {
  All = 'All',
  Any = 'Any',
}

export class BranchItem {
  @IsEnum(ComparsionType)
  type: ComparsionType;

  @Type(() => Condition)
  @IsArray()
  @ValidateNested()
  conditions: Condition[];

  @IsOptional()
  @IsInt()
  next?: number;
}

export class Branch extends NodeBase<NodeType.Branch> {
  @Type(() => BranchItem)
  @IsArray()
  @ValidateNested()
  branches: BranchItem[];
}

export class Request {
  @IsUrl()
  url: string;

  @IsObject()
  headers: Record<string, string>;

  body?: any;
}

export class ServiceCall extends NodeBase<NodeType.ServiceCall> {
  @ValidateNested()
  request: Request;

  @IsObject()
  response: Record<number, any>;

  @IsOptional()
  @IsInt()
  next?: number;

  @IsOptional()
  @IsInt()
  error?: number;
}

export class Transfer extends NodeBase<NodeType.Transfer> {
  @IsInt()
  @ValidateIf((object, value) => value !== null)
  assignTo: number | null;

  @IsOptional()
  @IsInt()
  next?: number;
}

export class Close extends NodeBase<NodeType.Close> {
  @IsOptional()
  @IsInt()
  next?: number;
}

export type Node =
  | Start
  | SendMessage
  | CollectInput
  | Buttons
  | Branch
  | ServiceCall
  | Transfer
  | Close;
