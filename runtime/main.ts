// @ts-ignore
import io from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

declare const Deno: Record<string, any>;

interface Session {
  chat: Record<string, any>;
  node: Record<string, any>;
  variables: Record<string, any>;
}

interface Schema {
  nodes: Array<Record<string, any>>;
  variables: Array<Record<string, any>>;
}

class ConfigByEnvironment {
  [key: string]: any;

  constructor() {
    Object.assign(this, Deno.env.toObject());
  }
}

class Chatbot {
  private schema: Schema;
  private session: Record<number, Session> = {};
  private io: any;

  constructor(private config: ConfigByEnvironment) {
    this.schema = JSON.parse(config.schema);
    this.io = io(config.ws, {
      transports: ['websocket'],
      auth: {
        token: config.token,
        trigger: this.getStartNode()?.trigger,
      },
    });

    this.io.on('chat', this.handleChat.bind(this));
  }

  start(): void {}

  private handleChat(chat: Record<string, any>): void {
    if (!this.session[chat.id]) {
      this.session[chat.id] = {
        chat,
        node: this.getStartNode(),
        variables: this.schema.variables,
      };
    }

    const session = this.session[chat.id];
  }

  private getStartNode(): any {
    return Object.values(this.schema.nodes).find((node: any) => node.type === 'Start');
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
