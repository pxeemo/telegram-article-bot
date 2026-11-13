import { BotContext } from "../types";
import { escapeHtml } from "../utils";

export async function startCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username ? `@${ctx.from.username}` : "there";

  const message = `👋 <b>Hello ${escapeHtml(username)}!</b>

I am a Telegram <b>Rich Messages & Articles</b> Bot powered by <b>grammY</b>, <b>Bun</b>, and <b>Cloudflare Workers</b>.

<b>How to use me:</b>
1. <b>Send any Rich HTML Article template:</b>
   • Send raw HTML directly as a text message, OR
   • Upload a template file (e.g. <code>.txt</code> or <code>.html</code>).
   • Supports full <b>RTL / LTR</b>: Auto-detects Persian, Arabic & Hebrew, or use <code>#rtl</code> at the top.

2. <b>Embed Media easily:</b>
   • Drop any photo, video, or file to get a ready-to-use <code>&lt;img src="tg://photo?id=..."/&gt;</code> code snippet!

3. <b>Publish to a channel without forward quoting:</b>
   Reply to one of my rendered outputs with:
   <code>/send @your_channel</code> or <code>/send -1001234567890</code>
   The article will be copied directly to the channel <i>without forward headers or quote attribution</i>.
   <i>(You must be the channel creator or an admin with message posting rights).</i>

4. <b>Schedule messages:</b>
   Schedule your <code>/send</code> reply directly using Telegram's built-in message scheduler (right-click / long-press the send arrow)!

<b>Commands:</b>
• /help — Detailed usage guide and scheduling instructions.
• /cheatsheet — Interactive HTML tags cheatsheet with collapsible categories.
• /id — Show your Telegram User ID.

🆔 <b>Your User ID:</b> <code>${userId ?? "Unknown"}</code>`;

  await ctx.reply(message, {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}

export async function idCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  await ctx.reply(
    `👤 <b>User ID:</b> <code>${userId ?? "N/A"}</code>\n💬 <b>Chat ID:</b> <code>${chatId ?? "N/A"}</code>`,
    { parse_mode: "HTML" }
  );
}
