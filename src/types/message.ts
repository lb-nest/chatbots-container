import { IsEnum, IsUrl, IsOptional, IsString } from 'class-validator';

export enum AttachmentType {
  Audio = 'Audio',
  Document = 'Document',
  Image = 'Image',
  Video = 'Video',
}

export class Attachment {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;
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
  @IsString()
  next?: string;
}
