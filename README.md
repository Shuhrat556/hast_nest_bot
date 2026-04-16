# hast_nest_bot

Telegram attendance bot project lives in `bot/`.

## CI/CD

- `CI` workflow: runs on push/PR and checks Node.js setup + syntax in `bot/src`.
- `CD Render` workflow: triggers Render deploy hook on push to `main/master`.

## Render Deploy Fix

If Render logs `ENOENT: /opt/render/project/src/package.json`, it means build ran from repo root.

- This repo keeps the Node app in `bot/`.
- Use Blueprint deploy with `render.yaml` (already added), or set Render service **Root Directory** to `bot`.

### Required GitHub Secret

Set repository secret:

- `RENDER_DEPLOY_HOOK_URL` — deploy hook URL from your Render service settings.
