import { Handle } from './handle';
import { Buttons, ButtonType, EventType } from './types';

export const handleButtons: Handle<Buttons> = (schema, sessions, io, next) => {
  return async (chat, node) => {
    const session = sessions[chat.contact.id];
    if (session.wait) {
      const button = node.buttons
        .filter(({ type }) => type === ButtonType.QuickReply)
        .find(({ text }) => text === chat.messages[0].content[0].text);

      if (button) {
        sessions[chat.contact.id].node = schema.nodes[<any>button.next];
      }

      next();
    } else {
      sessions[chat.contact.id].wait = true;

      await io.emitWithAck(EventType.CreateMessage, {
        contactId: chat.contact.id,
        channelId: chat.channelId,
        accountId: chat.accountId,
        text: node.text,
        buttons: node.buttons,
      });
    }
  };
};
