import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import {
  Branch,
  Buttons,
  Close,
  CollectInput,
  Node,
  NodeBase,
  NodeType,
  SendMessage,
  ServiceCall,
  Start,
  Transfer,
} from './node';
import { Variable } from './variable';

export class Schema {
  @Type(() => NodeBase, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: NodeType.Start, value: Start },
        { name: NodeType.SendMessage, value: SendMessage },
        { name: NodeType.CollectInput, value: CollectInput },
        { name: NodeType.Buttons, value: Buttons },
        { name: NodeType.Branch, value: Branch },
        { name: NodeType.ServiceCall, value: ServiceCall },
        { name: NodeType.Transfer, value: Transfer },
        { name: NodeType.Close, value: Close },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  @ValidateNested({ each: true })
  @IsArray()
  nodes: Node[];

  @Type(() => Variable)
  @ValidateNested({ each: true })
  @IsArray()
  variables: Variable[];
}
