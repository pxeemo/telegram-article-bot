import { Context } from "grammy";
import type { MediaGroupCoordinator } from "./coordinator/durable-object";

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

  /**
   * Optional Cloudflare KV Namespace for media group aggregation
   */
  MEDIA_GROUP_KV?: KVNamespace;

  /**
   * Optional Cloudflare Durable Object Namespace for media group aggregation
   */
  MEDIA_GROUP_DO?: DurableObjectNamespace<MediaGroupCoordinator>;
}

/**
 * Custom grammY Context that gives handlers access to Worker environment variables
 */
export interface BotContext extends Context {
  env: Env;
}
