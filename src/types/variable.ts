import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VariableType {
  Any = 'Any',
}

export class Variable {
  @IsString()
  id: string;

  @IsEnum(VariableType)
  type: VariableType;

  @IsString()
  name: string;

  @IsOptional()
  // TODO: conditional validation
  value?: any;
}
