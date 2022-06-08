import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { config } from 'dotenv';
import fastify from 'fastify';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ProcessManager } from './process-manager';
import { Schema } from './types';

config();

const schemas = validationMetadatasToSchemas();
const app = fastify({
  logger: true,
});
const manager = new ProcessManager();

app.post('/start', {
  schema: undefined,
  handler: async (req, reply) => {
    const schema = plainToClass(Schema, req.body);
    const errors = validateSync(schema);

    if (errors.length) {
      const error = new Error('body has validation errors');
      throw Object.assign(error, {
        statusCode: 400,
      });
    }

    const token = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);

    manager.start(token.id, 'runtime/main.ts', {
      schema: JSON.stringify({
        ...schema,
        nodes: Object.fromEntries(schema.nodes.map((node) => [node.id, node])),
      }),
      ws: token.ws,
      token: req.headers.token,
    });

    reply.code(204).send();
  },
});

app.post('/stop', {
  schema: undefined,
  handler: async (req, reply) => {
    const jwt = <JwtPayload>verify(String(req.headers.token), process.env.SECRET);
    manager.stop(jwt.id);

    reply.code(204).send();
  },
});

app.listen(Number(process.env.PORT));
