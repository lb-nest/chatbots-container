import { IsEnum, IsInt, IsString } from 'class-validator';

export enum VariableType {
  Auto = 'Auto',
}

export class Variable {
  @IsInt()
  id: number;

  @IsEnum(VariableType)
  type: VariableType;

  @IsString()
  name: string;

  value?: any;
}
