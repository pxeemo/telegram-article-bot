import { Bot } from "grammy";
import { BotContext, Env } from "./types";
import { startCommand, idCommand } from "./commands/start";
import { helpCommand } from "./commands/help";
import { sendCommand } from "./commands/send";
import { handleTextMessage, handleDocumentMessage } from "./handlers/template";

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
  bot.command("id", idCommand);
  bot.command("send", sendCommand);

  // Register handlers for incoming rich messages:
  // 1. Direct text messages
  bot.on("message:text", handleTextMessage);

  // 2. Uploaded HTML documents (.html, .htm, .txt)
  bot.on("message:document", handleDocumentMessage);

  // Global error handler
  bot.catch((err) => {
    console.error(`Error in bot update ${err.ctx.update.update_id}:`, err.error);
  });

  return bot;
}
