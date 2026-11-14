import { BotContext } from "../types";
import { escapeHtml } from "../utils";

/**
 * /id command:
 * - If replied to a forwarded message from a channel: returns that channel's ID and link.
 * - If replied to any message: returns that message's sender ID and message ID.
 * - If called directly in chat: returns the current chat ID and user ID.
 */
export async function idCommand(ctx: BotContext): Promise<void> {
  const replyMsg = ctx.message?.reply_to_message;

  if (replyMsg) {
    // 1. Check Telegram Bot API 7.0+ forward_origin
    if (replyMsg.forward_origin?.type === "channel") {
      const channel = replyMsg.forward_origin.chat;
      const originMsgId = replyMsg.forward_origin.message_id;
      const postLink = channel.username
        ? `https://t.me/${channel.username}/${originMsgId}`
        : `https://t.me/c/${Math.abs(channel.id).toString().replace(/^100/, "")}/${originMsgId}`;

      await ctx.reply(
        `📢 <b>Channel Details:</b>\n` +
          `• <b>Title:</b> <b>${escapeHtml(channel.title)}</b>\n` +
          `• <b>Chat ID:</b> <code>${channel.id}</code>\n` +
          `• <b>Type:</b> ${channel.username ? `@${escapeHtml(channel.username)}` : "Private Channel"}\n` +
          `• <b>Post ID:</b> <code>#${originMsgId}</code>\n\n` +
          `💡 <b>Commands:</b>\n` +
          `• Publish here: <code>/send ${channel.id}</code>\n` +
          `• Reply to this post: <code>/send ${channel.id} ${postLink}</code>`,
        { parse_mode: "HTML" }
      );
      return;
    }

    // 2. Check legacy forward_from_chat
    if ((replyMsg as any).forward_from_chat) {
      const chat = (replyMsg as any).forward_from_chat;
      await ctx.reply(
        `📢 <b>Forwarded Chat:</b>\n` +
          `• <b>Title:</b> <b>${escapeHtml(chat.title || "")}</b>\n` +
          `• <b>Chat ID:</b> <code>${chat.id}</code>\n\n` +
          `Publish command: <code>/send ${chat.id}</code>`,
        { parse_mode: "HTML" }
      );
      return;
    }

    // 3. Regular user message
    if (replyMsg.from) {
      await ctx.reply(
        `👤 <b>Message Sender:</b>\n` +
          `• <b>Name:</b> ${escapeHtml(replyMsg.from.first_name)}\n` +
          `• <b>User ID:</b> <code>${replyMsg.from.id}</code>\n` +
          `• <b>Message ID:</b> <code>#${replyMsg.message_id}</code>`,
        { parse_mode: "HTML" }
      );
      return;
    }
  }

  // Not replying to any message
  await ctx.reply(
    `🆔 <b>Chat &amp; User ID:</b>\n` +
      `• <b>Current Chat ID:</b> <code>${ctx.chat?.id}</code>\n` +
      `• <b>Your User ID:</b> <code>${ctx.from?.id}</code>\n\n` +
      `💡 <b>Tip for Channels:</b>\n` +
      `Reply with <code>/id</code> to any forwarded channel post to get its numeric Channel ID.`,
    { parse_mode: "HTML" }
  );
}
