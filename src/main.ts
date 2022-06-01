import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { config } from 'dotenv';
import fastify from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ProcessManager } from './process-manager';
import { off, on } from './schemas';
import { Schema } from './types';

config();

const app = fastify({ logger: true });
const manager = new ProcessManager();

app.post('/on', {
  schema: on,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);

    const schema = plainToClass(Schema, req.body);
    const errors = validateSync(schema);

    if (errors.length) {
      const error: any = new Error('body has validation errors');
      error.statusCode = 400;

      throw error;
    }

    manager.start(jwt.id, 'runtime/main.ts', {
      schema: JSON.stringify({
        ...schema,
        nodes: schema.nodes.reduce((s, n) => Object.assign(s, { [n.id]: n }), {}),
      }),
      ws: jwt.ws,
      token: req.headers.token,
    });

    reply.code(204).send();
  },
});

app.post('/off', {
  schema: off,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);
    manager.stop(jwt.id);

    reply.code(204).send();
  },
});

app.listen(Number(process.env.PORT));
