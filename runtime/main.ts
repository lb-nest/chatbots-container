// @ts-ignore
import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

declare const Deno: Record<string, any>;

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

function getStartNode(nodes: any[]) {
  return nodes.find((node) => node.type === 'Start');
}

class Chatbot {
  private session: Record<number, Session> = {};
  private io: any;

  constructor(private config: ConfigByEnvironment) {
    this.io = io(config.ws, {
      transports: ['websocket'],
      auth: {
        token: config.token,
        trigger: getStartNode(Object.values(config.schema.nodes))?.trigger,
      },
    });

    this.io.on('chat', this.handleChat.bind(this));
  }

  start(): void {}

  private handleChat(chat: Record<string, any>): void {
    if (!this.session[chat.id]) {
      this.session[chat.id] = {
        chat,
        node: getStartNode(Object.values(this.config.schema.nodes)),
        variables: this.config.schema.variables,
      };
    }

    const session = this.session[chat.id];
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
