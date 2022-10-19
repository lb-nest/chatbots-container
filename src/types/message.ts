import { IsEnum, IsUrl, IsOptional, IsString, ValidateIf, IsPhoneNumber } from 'class-validator';

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
  Url = 'Url',
  Phone = 'Phone',
}

export class Button {
  @IsEnum(ButtonType)
  type: ButtonType;

  @IsString()
  text: string;

  @ValidateIf(({ type }) => type === ButtonType.Url)
  @IsString()
  @IsUrl()
  url?: string;

  @ValidateIf(({ type }) => type === ButtonType.Phone)
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  next?: string;
}
