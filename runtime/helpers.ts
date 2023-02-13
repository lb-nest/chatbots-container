import {
  Chat,
  Node,
  NodeType,
  Schema,
  Start,
  TriggerType,
  Variable,
} from './types';

const isStart = (node: Node): node is Start => node.type === NodeType.Start;

export const findStart = (schema: Schema): Start => {
  const start = Object.values(schema.nodes).find(isStart);
  if (!start) {
    throw new Error('Start node was not found');
  }

  return start;
};

export const checkStart = (trigger: TriggerType, chat: Chat): boolean => {
  switch (trigger) {
    case TriggerType.NewChat:
      return chat.isNew;

    case TriggerType.Webhook:
      return true;

    default:
      throw new Error('Unknown trigger');
  }
};

export const initializeVariables = (
  schema: Schema,
): Record<string, Variable> => {
  return Object.fromEntries(
    schema.variables.map((variable) => [variable.name, variable]),
  );
};
