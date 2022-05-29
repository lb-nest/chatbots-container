export const request = {
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

export const response = {};

export const schema = {
  ...request,
  response: {
    204: response,
  },
};
