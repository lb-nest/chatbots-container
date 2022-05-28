import { WebsocketHandler } from '@fastify/websocket';
import { ConnectionManager } from './connection';

const manager = new ConnectionManager();

export const websocketHandler: WebsocketHandler = (connection) => {
  connection.socket.on('message', (data) => {
    try {
      const event = JSON.parse(data.toString());
      switch (event.type) {
        case 'init':
          manager.connect(event.payload, connection.socket);
          break;

        default:
          manager.listen(connection.socket, event);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  });

  connection.socket.on('close', () => {
    manager.disconnect(connection.socket);
  });
};
