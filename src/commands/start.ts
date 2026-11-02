import { BotContext } from "../types";
import { escapeHtml } from "../utils";

export async function startCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username ? `@${ctx.from.username}` : "there";

  const message = `👋 <b>Hello ${escapeHtml(username)}!</b>

I am a Telegram <b>Rich Messages & Articles</b> Bot powered by <b>grammY</b>, <b>Bun</b>, and <b>Cloudflare Workers</b>.

<b>How to use me:</b>
1. <b>Send any Rich HTML Article template:</b>
   • Send raw HTML as a text message, OR
   • Upload an <code>.html</code> file as a document (great for large articles!).
   • Supports full <b>RTL / LTR</b>: Auto-detects Persian, Arabic & Hebrew, or use <code>&lt;!-- rtl --&gt;</code> / <code>#rtl</code> at the top.

2. <b>Publish to a channel without forward quoting:</b>
   Reply to one of my rendered outputs with:
   <code>/send @your_channel</code> or <code>/send -1001234567890</code>
   The article will be copied directly to the channel <i>without forward headers or quote attribution</i>.
   <i>(You must be the channel creator or an admin with message posting rights).</i>

3. <b>Full HTML Reference:</b>
   Send /help to view the complete cheatsheet of supported Rich Article tags.

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
