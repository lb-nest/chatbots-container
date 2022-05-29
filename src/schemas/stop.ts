const request = {
  tags: ['chatbots'],
  summary: 'Stop the chatbot process',
  headers: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
      },
    },
    required: ['token'],
  },
};

const response = {};

export const stop = {
  ...request,
  response: {
    204: response,
  },
};
