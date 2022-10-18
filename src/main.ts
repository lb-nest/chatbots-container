import 'reflect-metadata';

import { diContainer, fastifyAwilixPlugin } from '@fastify/awilix';
import { asClass, asValue, Lifetime } from 'awilix';
import fastify from 'fastify';
import { config } from './config';
import { container } from './routes/container';
import { JwtService, ProcessManager } from './services';

async function bootstrap() {
  const app = fastify({
    logger: true,
  });

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
  });

  diContainer.register({
    config: asValue(config),
    jwt: asClass(JwtService, {
      lifetime: Lifetime.SINGLETON,
      dispose: (module) => module.dispose(),
    }),
    pm: asClass(ProcessManager, {
      lifetime: Lifetime.SINGLETON,
      dispose: (module) => module.dispose(),
    }),
  });

  app.register(container);
  app.listen({
    port: Number(process.env.PORT),
    host: '0.0.0.0',
  });
}
bootstrap();
