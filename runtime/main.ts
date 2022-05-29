import { ConfigByEnvironment } from './config.ts';
import { ConnectionManager } from './connection-manager.ts';
import { EventTypes } from './types.ts';

interface Session {
  chat: Record<string, any>;
  node: Record<string, any>;
  variables: Record<string, any>;
}

class Chatbot {
  private manager: ConnectionManager;
  private session: Record<number, Session> = {};
  constructor(private config: ConfigByEnvironment) {
    this.manager = new ConnectionManager(config.url, config.token);
    this.manager.on(EventTypes.IncomingChats, this.handleChat.bind(this));
  }

  start() {
    this.manager.start();
  }

  private handleChat(chat: Record<string, any>) {
    if (!this.session[chat.id]) {
      const { nodes, variables } = this.config.schema;
      this.session[chat.id] = {
        chat,
        node: nodes[0],
        variables,
      };
    }

    const session = this.session[chat.id];
    switch (session.node?.type) {
      case 'Start':
        // TODO: проверить условие
        // либо isFlow == true && assignedTo == chatbotId
        // либо isNew == true
        // если ни одно из условий не подошло, игнорировать контакт
        // TODO: переместиться на следующую ноду
        break;

      case 'SendMessage':
        // TODO: отправить сообщение
        // TODO: переместиться на следующую ноду
        break;

      case 'CollectInput':
        // TODO: отправить контакту сообщение и кнопки
        // TODO: пометить сессию как ожидающую ввода от контакта
        // TODO: записать полученное от контакта сообщение в переменную
        // TODO: переместиться на следующую ноду
        break;

      case 'Buttons':
        // TODO: отправить контакту сообщение и кнопки
        // TODO: пометить сессию как ожидающую ввода от контакта
        // TODO: основываясь на нажатой контактом кнопке
        // переместиться на следующую ноду
        break;

      case 'Branch':
        // TODO: выполнить условия
        // TODO: переместиться на следующую ноду
        break;

      case 'ServiceCall':
        // TODO: сделать вызов стороннего api
        // TODO: переместиться на следующую ноду
        break;

      case 'Close':
        // TODO: закрыть контакт
        // TODO: переместиться на следующую ноду
        break;

      case 'Transfer':
        // TODO: переназначить контакт на пользователя/чатбота
        // TODO: переместиться на следующую ноду
        break;

      case undefined:
        // TODO: взаимодействие с ботом окончено
        // удалить сессию контакта
        break;

      default:
        // TODO: неподдерживаемая рантаймом нода?
        break;
    }
  }
}

const chatbot = new Chatbot(new ConfigByEnvironment());
chatbot.start();
