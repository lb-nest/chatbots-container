import { Chatbot } from './chatbot';

async function bootstrap() {
  const chatbot = new Chatbot();
  chatbot.start();
}
bootstrap();
