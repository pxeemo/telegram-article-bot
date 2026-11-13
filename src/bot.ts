import { Bot } from "grammy";
import { BotContext, Env } from "./types";
import { startCommand } from "./commands/start";
import { helpCommand } from "./commands/help";
import { cheatsheetCommand } from "./commands/cheatsheet";
import { sendCommand } from "./commands/send";
import { handleTextMessage, handleDocumentMessage } from "./handlers/template";
import { handleMediaMessage } from "./handlers/media";

/**
 * Initializes and configures the grammY bot instance.
 */
export function createBot(env: Env): Bot<BotContext> {
  const bot = new Bot<BotContext>(env.BOT_TOKEN);

  // Attach Worker environment to the bot context
  bot.use(async (ctx, next) => {
    ctx.env = env;
    await next();
  });

  // Register commands
  bot.command("start", startCommand);
  bot.command("help", helpCommand);
  bot.command("cheatsheet", cheatsheetCommand);
  bot.command("send", sendCommand);

  // Register handlers:
  // 1. Direct text messages (HTML rich article templates)
  bot.on("message:text", handleTextMessage);

  // 2. Uploaded documents (.html/.htm/.txt templates OR other files to get <tg-document> tag)
  bot.on("message:document", handleDocumentMessage);

  // 3. Media uploads (photos, videos, GIFs, audio, voice) -> returns copy-pasteable tg:// tag
  bot.on(
    [
      "message:photo",
      "message:video",
      "message:animation",
      "message:audio",
      "message:voice",
    ],
    handleMediaMessage
  );

  // Global error handler
  bot.catch((err) => {
    console.error(`Error in bot update ${err.ctx.update.update_id}:`, err.error);
  });

  return bot;
}
