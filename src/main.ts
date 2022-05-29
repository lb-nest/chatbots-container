import 'reflect-metadata';
import fastifyCors from '@fastify/cors';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import fastify from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ValidatorError } from './errors/validator.error';
import { ProcessManager } from './process';
import * as start from './schema/start.schema';
import * as stop from './schema/stop.schema';
import { Schema } from './types';

const app = fastify({ logger: true });
const manager = new ProcessManager();

app.register(fastifyCors, {
  origin: '*',
});

app.route({
  method: 'POST',
  url: '/start',
  schema: start.schema,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);

    const schema = plainToClass(Schema, req.body);
    const errors = await validateSync(schema);

    if (errors.length) {
      throw new ValidatorError();
    }

    manager.start(jwt.sub, 'runtime/index.ts', {
      schema,
      url: jwt.aud,
      token: req.headers.token,
    });

    reply.code(204);
  },
});

app.route({
  method: 'POST',
  url: '/stop',
  schema: stop.schema,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);
    manager.stop(jwt.sub);

    reply.code(204);
  },
});

app.listen(Number(process.env.PORT));
