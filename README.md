# hast_nest_bot

Telegram attendance bot project lives in `bot/`.

## CI/CD

- `CI` workflow: runs on push/PR and checks Node.js setup + syntax in `bot/src`.
- `Deploy Bot` workflow: deploys to VPS over SSH on push to `main`, installs `bot/` dependencies, then restarts PM2 app `mybot`.

## VPS Deploy (PM2)

This project is deployed on your VPS from `/root/hast_nest_bot` and runs as PM2 process `mybot`.

Server commands:

```bash
cd /root/hast_nest_bot
git pull --ff-only origin main
cd bot && npm ci --omit=dev
cd ..
pm2 restart mybot --update-env || pm2 start ecosystem.config.js --only mybot
pm2 save
pm2 logs mybot
```

### Required GitHub Secrets

- `SERVER_IP` — target server IP or hostname
- `SSH_KEY` — private key allowed to SSH as `root`
