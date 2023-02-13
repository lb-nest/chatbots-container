import axios from 'axios';
import { Handle } from './handle';
import { ServiceCall } from './types';

export const handleServiceCall: Handle<ServiceCall> = (
  schema,
  sessions,
  io,
  next,
) => {
  return async (chat, node) => {
    const session = sessions[chat.contact.id];

    try {
      const res = await axios(node.url, {
        method: node.method,
        headers: node.headers,
        data: node.data,
      });

      if (node.variable) {
        session.variables[node.variable] = res.data;
      }

      sessions[chat.contact.id].node = schema.nodes[<any>node.next];
    } catch (e) {
      sessions[chat.contact.id].node = schema.nodes[<any>node.error];
    } finally {
      next();
    }
  };
};
