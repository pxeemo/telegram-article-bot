import { BotContext } from "../types";

export const START_MESSAGE_HTML = `
<h1>🐧 Penguins Posts</h1>
<p>Send any HTML text or upload a template file (<code>.html</code> / <code>.htm</code>) to preview your rich Telegram article.</p>

<blockquote>
Reply to any rendered preview with <code>/send @channel</code> to publish directly without forward tags.
</blockquote>

<p>Use /help for the usage guide and /cheatsheet for supported HTML tags.</p>

<tg-button-row align="center">
  <tg-button type="url" style="primary" url="https://github.com/pxeemo/telegram-article-bot">Open Source on GitHub</tg-button>
</tg-button-row>
`;

export async function startCommand(ctx: BotContext): Promise<void> {
  try {
    await ctx.replyWithRichMessage({
      html: START_MESSAGE_HTML.trim(),
    });
  } catch {
    const fallbackText = START_MESSAGE_HTML.replace(
      /<tg-button-row[^>]*>[\s\S]*?<\/tg-button-row>/gi,
      '<p><a href="https://github.com/pxeemo/telegram-article-bot">Open Source on GitHub</a></p>'
    ).trim();
    await ctx.reply(fallbackText, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}
