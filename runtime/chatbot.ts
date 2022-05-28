import { ConfigByEnvironmemt } from './config';
import { ConnectionManager } from './connection';
import { ChatbotEvents } from './events';

class Chatbot {
  private manager: ConnectionManager;

  constructor(config: ConfigByEnvironmemt) {
    this.manager = new ConnectionManager(new WebSocket(config.get('WS_URL')), config);
    this.manager.on(ChatbotEvents.IncomingMessage, (data) => {
      console.log(data);
    });
  }

  start() {
    return this.manager.start();
  }

  private handleMessage(data: Record<string, any>) {
    console.log(data);
  }
}

const chatbot = new Chatbot(new ConfigByEnvironmemt());
chatbot.start();
