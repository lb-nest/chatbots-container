import { Handle } from './handle';
import { Start } from './types';

export const handleStart: Handle<Start> = (schema, sessions, io, next) => {
  return (chat, node) => {
    sessions[chat.contact.id].node = schema.nodes[<any>node.next];
    next();
  };
};
