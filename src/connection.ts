import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import EventEmitter from 'events';

export class ConnectionManager extends EventEmitter {
  private connections: WeakMap<WebSocket, Record<string, any>> = new WeakMap<
    WebSocket,
    Record<string, any>
  >();

  connect(authorization: string, ws: WebSocket) {
    const init = jwt.verify(authorization, 'jwt') as Record<string, any>;

    init.handler = (data: Record<string, any>) => {
      ws.send(JSON.stringify(data));
    };

    this.connections.set(ws, init);
    this.on(`bot${init.id}:outgoing`, init.handler);
  }

  disconnect(ws: WebSocket) {
    const init = this.connections.get(ws);

    this.connections.delete(ws);
    this.off(`bot${init.id}:outgoing`, init.handler);

    ws.close();
  }

  send(id: number, data: Record<string, any>) {
    this.emit(`bot${id}:outgoing`, data);
  }

  listen(ws: WebSocket, data: Record<string, any>) {
    this.emit(data.type, this.connections.get(ws), data, (data: Record<string, any>) => {
      ws.send(JSON.stringify(data));
    });
  }
}
