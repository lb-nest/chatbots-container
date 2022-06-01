const request = {
  tags: ['chatbots'],
  summary: 'Start the chatbot process',
  headers: {
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
  },
};

const response = {};

export const on = {
  ...request,
  response: {
    204: response,
  },
};
