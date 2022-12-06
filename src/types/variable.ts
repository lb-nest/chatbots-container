import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VariableType {
  Any = 'Any',
}

export class Variable {
  @IsString()
  name: string;

  @IsEnum(VariableType)
  type: VariableType;

  @IsOptional()
  value?: any;
}
