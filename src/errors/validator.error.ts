import createError from '@fastify/error';

export class ValidatorError extends createError(
  'FST_ERR_VALIDATOR',
  'body has validation errors',
  400,
) {}
