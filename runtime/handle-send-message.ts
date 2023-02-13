import { Handle } from './handle';
import { EventType, SendMessage } from './types';

export const handleSendMessage: Handle<SendMessage> = (
  schema,
  sessions,
  io,
  next,
) => {
  return async (chat, node) => {
    sessions[chat.contact.id].node = schema.nodes[<any>node.next];

    await io.emitWithAck(EventType.CreateMessage, {
      contactId: chat.contact.id,
      channelId: chat.channelId,
      accountId: chat.accountId,
      text: node.text,
      attachments: node.attachments,
    });

    next();
  };
};
