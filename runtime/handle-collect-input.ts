import {
  Chat,
  CollectInput,
  EventType,
  ValidationOptions,
  ValidationType,
} from './types';
import { Handle } from './handle';

const validateInput = (
  type: ValidationType,
  text: any,
  opts?: ValidationOptions,
): boolean => {
  switch (type) {
    case ValidationType.Boolean:
      return typeof text === 'boolean';

    case ValidationType.Email:
      return true;

    case ValidationType.Number:
      return typeof text === 'number';

    case ValidationType.Phone:
      return true;

    case ValidationType.RegExp:
      return (
        typeof opts?.regexp === 'string' && new RegExp(opts.regexp).test(text)
      );

    case ValidationType.String:
      return typeof text === 'string';
  }
};

export const handleCollectInput: Handle<CollectInput> = (
  schema,
  sessions,
  io,
  next,
) => {
  return async (chat, node) => {
    const session = sessions[chat.contact.id];
    if (session.wait) {
      const [{ text }] = chat.messages[0].content;

      if (validateInput(node.validation, text, node)) {
        session.variables[node.variable].value = text;
        session.node = schema.nodes[<any>node.next];
      }

      next();
    } else {
      session.wait = true;

      await io.emitWithAck(EventType.CreateMessage, {
        contactId: chat.contact.id,
        channelId: chat.channelId,
        accountId: chat.accountId,
        text: node.text,
      });
    }
  };
};
