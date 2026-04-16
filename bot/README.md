# Telegram room attendance bot

A production-oriented [Telegraf](https://telegraf.js.org/) bot that collects room selection, headcount, and optional absence reasons, then posts a formatted summary to a Telegram group. State is stored in MongoDB via Mongoose.

On first `/start`, users choose language (`Русский`, `Тоҷикӣ`, `English`). The bot also auto-seeds default rooms on startup:
`Komnata 1..8` and `Ma'muriyat`.

## Prerequisites

- [Node.js](https://nodejs.org/) 20.x or newer (LTS recommended)
- A MongoDB deployment (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A Telegram group where the bot can post, and the numeric `GROUP_ID` (often negative for supergroups)

### Bot permissions

- Add the bot to the target group.
- Allow it to send messages in that group.
- For private chats with users, no extra scope is required beyond starting the bot.

### Finding `GROUP_ID` and `ADMIN_ID`

- Forward a message from the group to [@userinfobot](https://t.me/userinfobot) or [@getidsbot](https://t.me/getidsbot), or use Telegram clients that show chat ID.
- Your `ADMIN_ID` is your numeric user ID from the same kind of bot.

## Install

```bash
cd bot
cp .env.example .env
# Edit .env with real values
npm install
```

## Configure

Set variables in `.env` (see `.env.example`):

| Variable   | Description                                      |
|-----------|---------------------------------------------------|
| `BOT_TOKEN` | Bot token from BotFather                        |
| `MONGO_URI` | Mongo connection string                         |
| `GROUP_ID`  | Chat ID where reports are posted                |
| `ADMIN_ID`  | Telegram user ID allowed to run `/addroom`      |
| `NODE_ENV`  | `development` (default) or `production` — controls log format |
| `LOG_LEVEL` | Winston level: `error`, `warn`, `info`, … (default `info`) |
| `PORT`      | Optional; if set, a tiny `/health` server starts |

Logs use **Winston**. In `production`, the console transport emits JSON lines suitable for aggregators; in development, logs are colorized plain text.

## Run

```bash
npm start
```

Development with auto-restart (Node 18+):

```bash
npm run dev
```

### Seed a room (admin)

In a private chat with the bot (as the admin user):

```text
/addroom Conference Room 12
```

The last token is capacity; everything before it is the room name.

## Deploy on [Render](https://render.com/)

This process is a **long-running worker** (Telegram long polling), not a typical HTTP app.

1. Create a **MongoDB** instance (Render MongoDB, Atlas, or other) and copy the connection string into `MONGO_URI`.
2. In the Render dashboard, create a **Background Worker** (recommended) or a **Web Service**.
   - **Background Worker**: set **Build Command** to `npm install` and **Start Command** to `npm start`. No `PORT` is required.
   - **Web Service**: same build/start commands. Optionally set `PORT` in the environment (Render injects it automatically) so the bundled `/health` endpoint responds for platform checks.
3. Add environment variables: `BOT_TOKEN`, `MONGO_URI`, `GROUP_ID`, `ADMIN_ID`, and optionally `NODE_ENV=production`, `LOG_LEVEL`.
4. Deploy. Watch logs to confirm `MongoDB connected` and `Bot is running`.

**Note:** Only one instance should run `bot.launch()` with the same token at a time, or Telegram will disconnect duplicate polling clients.

## Project layout

```text
bot/
├── src/
│   ├── bot.js
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── errors/
│   ├── models/
│   ├── handlers/
│   ├── services/
│   ├── validation/
│   └── utils/
├── .env.example
├── package.json
└── README.md
```

## License

MIT
