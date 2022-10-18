import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { FastifyPluginCallback } from 'fastify';
import { JwtService, ProcessManager } from '../services';
import { Schema } from '../types';

export const container: FastifyPluginCallback = (app, _, done) => {
  app.post('/start', async (req, reply) => {
    const schema = plainToClass(Schema, req.body);

    const validationErrors = await validate(schema);
    if (validationErrors.length > 0) {
      return reply.code(400).send({
        message: 'body has validation errors',
        error: 'Bad Request',
        statusCode: 400,
        extensions: {
          validationErrors,
        },
      });
    }

    const jwt = req.diScope.resolve<JwtService>('jwt').verify(req.headers.token.toString());
    req.diScope.resolve<ProcessManager>('pm').start(jwt.id, 'deno-runtime/main.ts', {
      schema: JSON.stringify(
        Object.assign(schema, {
          nodes: Object.fromEntries(schema.nodes.map((node) => [node.id, node])),
        }),
      ),
      ws: jwt.ws,
      token: req.headers.token,
    });

    return reply.code(204).send();
  });

  app.post('/stop', async (req, reply) => {
    req.diScope
      .resolve<ProcessManager>('pm')
      .stop(req.diScope.resolve<JwtService>('jwt').verify(req.headers.token.toString()).id);

    return reply.code(204).send();
  });

  done();
};
