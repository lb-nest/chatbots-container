import 'reflect-metadata';
import fastifyWebsocket from '@fastify/websocket';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { config } from 'dotenv';
import fastify from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ProcessManager } from './process-manager';
import { start, stop } from './schemas';
import { Schema } from './types';

config();

const app = fastify({ logger: true });
const manager = new ProcessManager();

app.register(fastifyWebsocket);

app.post('/start', {
  schema: start,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);

    const schema = plainToClass(Schema, req.body);
    const errors = validateSync(schema);

    if (errors.length) {
      const error: any = new Error('body has validation errors');
      error.statusCode = 400;

      throw error;
    }

    manager.start(jwt.sub, 'runtime/main.ts', {
      schema: JSON.stringify({
        nodes: schema.nodes.reduce((s, n) => Object.assign(s, { [n.id]: n })),
        variables: schema.variables,
      }),
      url: jwt.aud,
      token: req.headers.token,
    });

    reply.code(204).send();
  },
});

app.post('/stop', {
  schema: stop,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);
    manager.stop(jwt.sub);

    reply.code(204).send();
  },
});

app.get('/', { websocket: true }, (connection) => {
  connection.socket.on('message', (data) => {
    console.log(data.toString());
  });
});

app.listen(Number(process.env.PORT));
