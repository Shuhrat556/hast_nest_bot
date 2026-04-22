# hast_nest_bot

Telegram attendance bot project lives in `bot/`.

## CI/CD

- `CI` workflow: runs on push/PR and checks Node.js setup + syntax in `bot/src`.
- `CD Render` workflow: triggers Render deploy hook on push to `main/master`.
- `Deploy Bot` workflow: deploys to your server over SSH and rebuilds the Docker Compose stack on pushes to `main`.

## Docker Deploy

This repo keeps the Node app in `bot/`, but the Docker files live at the repository root so you can deploy with a single `docker compose up`.

### Files added

- `Dockerfile` builds the production image with Node 20 Alpine and starts the bot via `pm2-runtime`.
- `ecosystem.config.js` runs `./bot/src/bot.js` in PM2 fork mode with restart protection.
- `.dockerignore` keeps `node_modules`, `.env`, Git metadata, and logs out of the build context.
- `docker-compose.yml` runs the bot container with `.env` and mounts `./logs` into `/app/logs`.

### Local/Server commands

Create a root-level `.env` using values from [`bot/.env.example`](bot/.env.example), then run:

```bash
docker build -t mybot .
docker run -d --name mybot_container --env-file .env mybot
docker logs -f mybot_container
```

Or with Compose:

```bash
docker compose up -d --build
```

### Required GitHub Secrets

- `SERVER_IP` — target server IP or hostname
- `SSH_KEY` — private key allowed to SSH as `root`

## Render Deploy Fix

If Render logs `ENOENT: /opt/render/project/src/package.json`, it means build ran from repo root.

- This repo keeps the Node app in `bot/`.
- Use Blueprint deploy with `render.yaml` (already added), or set Render service **Root Directory** to `bot`.

### Required GitHub Secret

Set repository secret:

- `RENDER_DEPLOY_HOOK_URL` — deploy hook URL from your Render service settings.
