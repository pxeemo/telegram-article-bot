# Penguins Posts — Telegram Rich HTML & Articles Bot

A Telegram bot built with **grammY** and **TypeScript**, powered by **Bun**, and designed to run on **Cloudflare Workers** using **Wrangler**.

---

## Features

1. **Rich HTML & Articles Preview:**
   - **Text Messages or Template Files:** Send raw HTML in chat, OR upload `.html` or `.htm` files.
   - When an HTML/template file is sent, the bot outputs both:
     1. The copy-pasteable `<tg-document>` media snippet (so you can embed the file as an attachment in articles).
     2. The rendered rich article post.
   - Rendered using Telegram's **Rich Message API** (`sendRichMessage`), supporting modern article elements (headings `<h1>`-`<h6>`, `<details>`, `<table>`, `<mark>`, checklists, `<tg-button>`, `<tg-button-row>`, `<figure>`, math, etc.).
   - Full **RTL / LTR Support:** Persian, Arabic, and Hebrew articles are automatically detected and rendered RTL. You can also explicitly specify `#rtl` / `#ltr` or `<!-- rtl -->` / `<!-- ltr -->` at the top of your text or file.
2. **Media Helper:**
   - Drop any photo, video, animation, audio, or document file into the chat with the bot.
   - The bot replies with single tag and figure code blocks (e.g. `<pre><code><img src="tg://photo?id=..."/></code></pre>`).
   - The bot automatically maps Telegram file IDs to compliant `media` payload entries when rendering.
3. **Channel Publishing, Replies & Scheduling (`/send`):**
   - Reply to any rendered bot output with `/send @channel_username` or `/send -100xxxxxxxxxx`.
   - **No Forward Tags:** Copies the article directly to the channel using `copyMessage` without any forward headers or quote attribution.
   - **Send as Reply to a Specific Post:**
     - Same channel: `/send @channel https://t.me/channel/123` or simply `/send https://t.me/channel/123`
     - Cross-channel replies: `/send @channel https://t.me/otherchannel/123`
   - **Private Channels Support:**
     - Forward any post from your private channel and reply with `/id` to get its numeric channel ID (e.g. `-1001234567890`).
     - Or copy any message link (`t.me/c/1234567890/42`) and prepend `-100` to the first number.
   - **In-Channel Permission Verification:** Checks directly in the target channel via `getChatMember` whether the caller is the channel Owner (`creator`) or an Administrator with `can_post_messages` enabled.
   - **Native Scheduled Messages:** Schedule your `/send` command using Telegram's native message scheduler to publish automatically at a future time.
4. **Commands:**
   - `/start`: Simple and brief rich introduction with GitHub source link.
   - `/help`: General usage guide, media workflow, reply options, and private channel instructions.
   - `/cheatsheet`: Interactive HTML cheatsheet with collapsible categories (`<details>`) and clean code snippets without HTML comments.
   - `/id`: Get user ID, chat ID, or reply to a forwarded post to get channel details.

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

#### Option B: Via Telegram Bot API curl
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-worker>.<your-subdomain>.workers.dev/&secret_token=<SECRET_TOKEN>"
```
