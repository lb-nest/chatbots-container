import { Handle } from './handle';
import { Assign, ContactStatus, EventType } from './types';

export const handleAssign: Handle<Assign> = (schema, sessions, io, next) => {
  return async (chat, node) => {
    sessions[chat.contact.id].node = schema.nodes[<any>node.next];

    await io.emitWithAck(EventType.UpdateContact, {
      id: chat.contact.id,
      assignedTo: node.assignedTo,
      status: ContactStatus.Open,
    });

    next();
  };
};
