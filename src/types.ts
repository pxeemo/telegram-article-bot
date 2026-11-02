import { Context } from "grammy";

/**
 * Cloudflare Worker Environment Bindings
 */
export interface Env {
  /**
   * Telegram Bot API Token obtained from @BotFather
   */
  BOT_TOKEN: string;

  /**
   * Optional secret token to authenticate Telegram webhook requests
   * (Matches X-Telegram-Bot-Api-Secret-Token header)
   */
  SECRET_TOKEN?: string;
}

/**
 * Custom grammY Context that gives handlers access to Worker environment variables
 */
export interface BotContext extends Context {
  env: Env;
}
