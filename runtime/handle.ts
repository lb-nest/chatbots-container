import { Socket } from 'socket.io-client';
import { Chat, Node, Schema, Session } from './types';

export type Handle<T extends Node> = (
  schema: Schema,
  sessions: Record<number, Session>,
  io: Socket,
  next: () => void,
) => (chat: Chat, Node: T) => Promise<void> | void;
