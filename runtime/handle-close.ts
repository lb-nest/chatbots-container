import { Handle } from './handle';
import { Close, ContactStatus, EventType } from './types';

export const handleClose: Handle<Close> = (schema, sessions, io, next) => {
  return async (chat, node) => {
    sessions[chat.contact.id].node = schema.nodes[<any>node.next];

    await io.emitWithAck(EventType.UpdateContact, {
      id: chat.contact.id,
      assignedTo: null,
      status: ContactStatus.Closed,
    });

    next();
  };
};
