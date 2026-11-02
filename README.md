# Penguins Posts — Telegram Rich HTML & Articles Bot

A Telegram bot built with **grammY** and **TypeScript**, powered by **Bun**, and designed to run on **Cloudflare Workers** using **Wrangler**.

---

## Features

1. **Rich HTML & Articles Preview:**
   - **Text Messages or HTML Files:** Send your template directly as a chat text message, OR upload an `.html` / `.htm` document (ideal for long-form articles).
   - Rendered using Telegram's **Rich Message API** (`sendRichMessage`), supporting modern article elements (headings `<h1>`-`<h6>`, `<details>`, `<table>`, `<mark>`, checklists, `<tg-button>`, `<tg-button-row>`, `<figure>`, math, etc.).
   - Full **RTL / LTR Support:** Persian, Arabic, and Hebrew articles are automatically detected and rendered RTL. You can also explicitly specify `<!-- rtl -->` / `<!-- ltr -->` or `#rtl` / `#ltr` at the top of your text or file.
2. **Channel Publishing (`/send`):**
   - Reply to any rendered bot output with `/send @channel_username` or `/send -100xxxxxxxxxx`.
   - **No Forward Tags:** Copies the article directly to the channel using `copyMessage` without any forward header or quote tags.
   - **Dynamic In-Channel Permission Verification:** No hardcoded user IDs. When `/send` is executed, the bot checks directly in the target channel via `getChatMember` whether the caller is the channel Owner (`creator`) or an Administrator with `can_post_messages` enabled.
3. **Complete HTML Cheatsheet (`/help`):**
   A fast, copy-pasteable cheatsheet of all Rich HTML tags: headings, typography, `<tg-button>`, `<tg-button-row>`, `<tg-emoji>`, tables, checklists, media collages/slideshows, and LaTeX math.

---

## Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

### 2. Configure Environment Variables

Copy the example development variables:
```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` (or configure secrets in Cloudflare Workers):
```ini
# Bot Token from @BotFather
BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ

# Optional secret token to verify Telegram webhooks
SECRET_TOKEN=your_secure_secret_token
```

### 3. Local Development

Run the worker locally:
```bash
bun run dev
```

Run TypeScript verification:
```bash
bun run typecheck
```

---

## Deployment to Cloudflare Workers

### 1. Deploy the Worker
```bash
bun run deploy
```

### 2. Set Secrets on Cloudflare
```bash
wrangler secret put BOT_TOKEN
wrangler secret put SECRET_TOKEN  # Optional
```

### 3. Register the Telegram Webhook

#### Option A: Built-in Helper Endpoint
Open your deployed worker URL in your browser:
```
https://<your-worker>.<your-subdomain>.workers.dev/setWebhook?secret=<SECRET_TOKEN>
```
*(If you did not set `SECRET_TOKEN`, omit the `?secret=...` query parameter).*

#### Option B: Via Telegram Bot API curl
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-worker>.<your-subdomain>.workers.dev/&secret_token=<SECRET_TOKEN>"
```

---

## Usage Guide

- **Preview Rich Articles:**
  - Send raw HTML in a chat message, OR
  - Upload an `.html` file as a document.
- **Publish without Forward Tag:** Reply to the previewed output with:
  ```
  /send @my_channel
  ```
  or
  ```
  /send -1001234567890
  ```
  The bot verifies in `@my_channel` that you are the creator or an administrator with message posting rights, and then copies the article without forward tags.
- **View Cheatsheet:** Send `/help` in chat.
- **Get IDs:** Send `/id` to check your User ID and Chat ID.
