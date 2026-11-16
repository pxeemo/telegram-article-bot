import { webhookCallback } from "grammy";
import { createBot } from "./bot";
import { BotContext, Env } from "./types";
import { Bot } from "grammy";

// Export Durable Object class so Cloudflare Workers can bind to it if MEDIA_GROUP_DO is configured
export { MediaGroupCoordinator } from "./coordinator/durable-object";

// Cached bot and handler instances across isolate invocations
let cachedBot: Bot<BotContext> | null = null;
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;
let cachedToken: string | null = null;

function getWebhookHandler(env: Env) {
  if (cachedHandler && cachedToken === env.BOT_TOKEN) {
    return { bot: cachedBot!, handler: cachedHandler };
  }

  const bot = createBot(env);
  const handler = webhookCallback(bot, "cloudflare-mod", {
    secretToken: env.SECRET_TOKEN,
  });

  cachedBot = bot;
  cachedHandler = handler;
  cachedToken = env.BOT_TOKEN;

  return { bot, handler };
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (!env.BOT_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "BOT_TOKEN is missing. Please set BOT_TOKEN in your Cloudflare Worker variables or secrets.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(request.url);

    // Telegram sends updates via POST
    if (request.method === "POST") {
      const { handler } = getWebhookHandler(env);
      return handler(request);
    }

    // Convenience endpoint to register the webhook with Telegram
    if (request.method === "GET" && url.pathname === "/setWebhook") {
      const secret = url.searchParams.get("secret");
      if (env.SECRET_TOKEN && secret !== env.SECRET_TOKEN) {
        return new Response("Unauthorized: invalid secret query parameter", { status: 401 });
      }

      const { bot } = getWebhookHandler(env);
      const webhookUrl = `${url.origin}/`;

      try {
        await bot.api.setWebhook(webhookUrl, {
          secret_token: env.SECRET_TOKEN,
          drop_pending_updates: url.searchParams.get("drop_pending") === "true",
        });

        const info = await bot.api.getWebhookInfo();
        return new Response(
          JSON.stringify(
            {
              success: true,
              message: `Webhook successfully configured to ${webhookUrl}`,
              webhookInfo: info,
            },
            null,
            2
          ),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify(
            {
              success: false,
              error: err?.message || "Failed to set webhook",
            },
            null,
            2
          ),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Webhook info debug endpoint
    if (request.method === "GET" && url.pathname === "/webhookInfo") {
      const secret = url.searchParams.get("secret");
      if (env.SECRET_TOKEN && secret !== env.SECRET_TOKEN) {
        return new Response("Unauthorized: invalid secret query parameter", { status: 401 });
      }

      const { bot } = getWebhookHandler(env);
      try {
        const info = await bot.api.getWebhookInfo();
        return new Response(JSON.stringify(info, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Health check endpoint
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Penguins Posts Bot</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 650px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>🐧 Penguins Posts Telegram Bot</h1>
  <p>The bot is running on <b>Cloudflare Workers</b> with <b>grammY</b>.</p>
  <h3>Features:</h3>
  <ul>
    <li><b>HTML Preview:</b> Every incoming text message is rendered as a Telegram Rich HTML template.</li>
    <li><b>Forward without Quotes:</b> Reply to any bot output with <code>/send &lt;channel&gt;</code> to post to your channel.</li>
    <li><b>HTML Reference:</b> Send <code>/help</code> in chat for complete documentation of supported HTML tags.</li>
  </ul>
</body>
</html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  },
};
