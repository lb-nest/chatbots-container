import 'reflect-metadata';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { io } from 'socket.io-client';
import { config } from './config';
import { verify } from './jwt';
import { start, stop } from './pm';
import { Schema } from './types';

async function bootstrap() {
  const socket = io(config.CHATBOTS_URL, {
    auth: {
      containerId: config.CONTAINER_ID,
    },
  });

  socket.on('start', async (body, headers: Record<string, any>) => {
    try {
      const schema = plainToClass(Schema, body);

      const validationErrors = await validate(schema, {
        whitelist: true,
      });

      if (validationErrors.length > 0) {
        return socket.emit('start', {
          message: 'schema has validation errors',
          validationErrors,
        });
      }

      const jwt = verify(headers.token);
      await start(jwt.id, {
        schema: JSON.stringify(
          Object.assign(schema, {
            nodes: Object.fromEntries(
              schema.nodes.map((node) => [node.id, node]),
            ),
          }),
        ),
        id: jwt.id,
        ws: jwt.ws,
        token: headers.token,
      });

      return socket.emit('start', {
        message: 'success',
      });
    } catch (e) {
      return socket.emit('start', e);
    }
  });

  socket.on('stop', async (_, headers: Record<string, any>) => {
    try {
      const jwt = verify(headers.token);
      await stop(jwt.id);

      return socket.emit('stop', {
        message: 'success',
      });
    } catch (e) {
      return socket.emit('stop', e);
    }
  });
}
bootstrap();
