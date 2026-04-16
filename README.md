# hast_nest_bot

Telegram attendance bot project lives in `bot/`.

## CI/CD

- `CI` workflow: runs on push/PR and checks Node.js setup + syntax in `bot/src`.
- `CD Render` workflow: triggers Render deploy hook on push to `main/master`.

### Required GitHub Secret

Set repository secret:

- `RENDER_DEPLOY_HOOK_URL` — deploy hook URL from your Render service settings.
