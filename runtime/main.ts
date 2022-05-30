import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

interface Session {
  chat: Record<string, any>;
  node: Record<string, any>;
  variables: Record<string, any>;
}

class ConfigByEnvironment {
  [key: string]: any;

  constructor() {
    Object.assign(this, Deno.env.toObject());
  }
}

class Chatbot {
  private session: Record<number, Session> = {};
  private io: any;

  constructor(private config: ConfigByEnvironment) {
    this.io = io(config.ws, {
      transports: ['websocket'],
      auth: {
        token: config.token,
      },
    });

    this.io.on('connect_error', (data: any) => {
      console.log('reconnect', data);
    });
    this.io.on('error', console.log);
    this.io.on('event', console.log);

    this.io.emit('event', 'data');
  }

  start(): void {
    console.log('start');
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
