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
import { Attachment, Button } from './message';

export enum NodeType {
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

export class NodeBase<T extends NodeType> {
  @IsString()
  id: string;

  @IsEnum(NodeType)
  type: T;
}

export enum TriggerType {
  NewChat = 'NewChat',
  Webhook = 'Webhook',
}

export class Start extends NodeBase<NodeType.Start> {
  @IsEnum(TriggerType)
  trigger: TriggerType;

  @IsOptional()
  @IsString()
  next?: string;
}

export class SendMessage extends NodeBase<NodeType.SendMessage> {
  @IsString()
  text: string;

  @Type(() => Attachment)
  @ValidateNested({ each: true })
  @IsArray()
  attachments: Attachment[];

  @IsOptional()
  @IsString()
  next?: string;
}

export enum ValidationType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Email = 'Email',
  Phone = 'Phone',
  RegExp = 'RegExp',
}

export class CollectInput extends NodeBase<NodeType.CollectInput> {
  @IsString()
  text: string;

  @IsString()
  variable: string;

  @IsEnum(ValidationType)
  validation: ValidationType;

  @ValidateIf(
    (object: CollectInput) => object.validation === ValidationType.RegExp,
  )
  @IsString()
  regexp?: string;

  @IsOptional()
  @IsString()
  next?: string;
}

export class Buttons extends NodeBase<NodeType.Buttons> {
  @IsString()
  text: string;

  @Type(() => Button)
  @ValidateNested({ each: true })
  @IsArray()
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

export class Condition {
  @IsString()
  variable1: string;

  @IsEnum(OperatorType)
  operator: OperatorType;

  @IsString()
  variable2: string;
}

export enum ComparsionType {
  All = 'All',
  Any = 'Any',
}

export class BranchItem {
  @IsEnum(ComparsionType)
  type: ComparsionType;

  @Type(() => Condition)
  @ValidateNested({ each: true })
  @IsArray()
  conditions: Condition[];

  @IsOptional()
  @IsString()
  next?: string;
}

export class Branch extends NodeBase<NodeType.Branch> {
  @Type(() => BranchItem)
  @ValidateNested({ each: true })
  @IsArray()
  branches: BranchItem[];

  @IsOptional()
  @IsString()
  default?: string;
}

export class ServiceCall extends NodeBase<NodeType.ServiceCall> {
  @IsUrl()
  url: string;

  @IsObject()
  headers: Record<string, string>;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsString()
  variable?: string;

  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

export class Transfer extends NodeBase<NodeType.Transfer> {
  @IsInt()
  @ValidateIf((object, value) => value !== null)
  assignedTo: number | null;

  @IsOptional()
  @IsString()
  next?: string;
}

export class AssignTag extends NodeBase<NodeType.AssignTag> {
  @IsInt()
  tagId: number;

  @IsOptional()
  @IsString()
  next?: string;
}

export class Close extends NodeBase<NodeType.Close> {
  @IsOptional()
  @IsString()
  next?: string;
}

export type Node =
  | Start
  | SendMessage
  | CollectInput
  | Buttons
  | Branch
  | ServiceCall
  | Transfer
  | AssignTag
  | Close;
