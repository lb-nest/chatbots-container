export const request = {
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

export const response = {};

export const schema = {
  ...request,
  response: {
    204: response,
  },
};
