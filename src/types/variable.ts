import { IsEnum, IsString } from 'class-validator';

export enum VariableType {
  String = 'String',
}

export class Variable {
  @IsString()
  id: string;

  @IsEnum(VariableType)
  type: VariableType;

  @IsString()
  name: string;

  // TODO: conditional validation
  value?: any;
}
