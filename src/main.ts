import 'reflect-metadata';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import fastify from 'fastify';
import path from 'path';
import { websocketHandler } from './websocket';

const app = fastify({ logger: true });

app.register(fastifyWebsocket);
app.register(fastifyStatic, {
  root: path.resolve('public'),
});

app.route({
  method: 'POST',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
        },
      },
      required: ['token'],
    },
    body: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
        },
        schema: {
          type: 'string',
        },
      },
      required: ['url', 'source'],
    },
    response: {
      201: {
        pid: {
          type: 'number',
        },
      },
    },
  },
  url: '/start',
  handler: async (req, reply) => {
    // TODO: start chatbot process

    reply.code(201).send({ pid: 0 });
  },
});

app.route({
  method: 'POST',
  url: '/stop',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
        },
      },
      required: ['token'],
    },
    response: {
      204: {},
    },
  },
  handler: async (req, reply) => {
    // TODO: stop chatbot process

    reply.code(204);
  },
});

app.get('/', { websocket: true }, websocketHandler);

app.listen(1337);
