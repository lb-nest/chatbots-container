import 'reflect-metadata';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { config } from 'dotenv';
import fastify from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ProcessManager } from './process-manager';
import { Schema } from './types';

config();

const processManager = new ProcessManager();
const app = fastify({
  logger: true,
});

app.post('/start', {
  handler: async (req, reply) => {
    const schema = plainToClass(Schema, req.body);

    const errors = await validate(schema);
    if (errors.length) {
      throw Object.assign(new Error('body has validation errors'), {
        statusCode: 400,
      });
    }

    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);

    processManager.start(jwt.id, 'deno-runtime/main.ts', {
      schema: JSON.stringify({
        ...schema,
        nodes: Object.fromEntries(schema.nodes.map((node) => [node.id, node])),
      }),
      ws: jwt.ws,
      token: req.headers.token,
    });

    reply.code(204).send();
  },
});

app.post('/stop', {
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);
    processManager.stop(jwt.id);

    reply.code(204).send();
  },
});

app.listen(Number(process.env.PORT), '0.0.0.0');
