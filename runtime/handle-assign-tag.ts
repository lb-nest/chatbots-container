import { Handle } from './handle';
import { AssignTag, EventType } from './types';

export const handleAssignTag: Handle<AssignTag> = (
  schema,
  sessions,
  io,
  next,
) => {
  return async (chat, node) => {
    sessions[chat.contact.id].node = schema.nodes[<any>node.next];

    await io.emitWithAck(EventType.UpdateContact, {
      id: chat.contact.id,
      tags: [node.tagId],
    });

    next();
  };
};
