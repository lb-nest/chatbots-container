import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
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

export class Flow {
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
  @ValidateNested()
  nodes: Node[];

  @Type(() => Variable)
  @ValidateNested()
  variables: Variable[];
}