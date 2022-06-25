## Chatbots

### Turning on the chatbot

```
Type: POST
Route: /start
```

Headers

```json
{
  "token": "jwt"
}
```

Body

```json
{
  "nodes": [
    {
      "id": "0",
      "type": "Start",
      "name": "Bot is triggered if...",
      "trigger": "NewChat",
      "next": "1"
    },
    {
      "id": "1",
      "type": "SendMessage",
      "name": "Send message 1",
      "text": "Hi there! My name is...",
      "attachments": []
    }
  ],
  "variables": []
}
```

Response 204

### Turning off the chatbot

```
Type: POST
Route: /stop
```

Headers

```json
{
  "token": "jwt"
}
```

Response 204
