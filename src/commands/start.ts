import { BotContext } from "../types";

export const START_MESSAGE_HTML = `
<h1>🐧 Penguins Posts</h1>
<p>Send any HTML text or upload a template file (<code>.txt</code> / <code>.html</code>) to preview your rich Telegram article.</p>

<blockquote>
Reply to any rendered preview with <code>/send @channel</code> to publish directly without forward tags.
</blockquote>

<p>Use /help for the usage guide and /cheatsheet for supported HTML tags.</p>
`;

export async function startCommand(ctx: BotContext): Promise<void> {
  try {
    await ctx.replyWithRichMessage({
      html: START_MESSAGE_HTML.trim(),
    });
  } catch {
    await ctx.reply(START_MESSAGE_HTML.trim(), {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}
