import { BotContext } from "../types";

export const GENERAL_HELP_TEXT = `
<h1>📖 Penguins Posts — Help</h1>
<p>Compose, preview, and publish rich Telegram articles to your channels without forward tags.</p>

<h3>1. Create &amp; Preview</h3>
<ul>
  <li><b>HTML Text:</b> Send raw HTML directly in chat.</li>
  <li><b>Template Files:</b> Upload an <code>.html</code> or <code>.htm</code> file.</li>
  <li><b>RTL / LTR:</b> Automatically detected, or force with <code>#rtl</code> / <code>#ltr</code> at the start.</li>
  <li><b>Media:</b> Send any photo, video, audio, or document to get its embed tag.</li>
</ul>

<h3>2. Publish (/send)</h3>
<p>Reply to any rendered preview with:</p>
<pre><code>/send @channel</code></pre>

<p><b>Reply to a specific post:</b></p>
<pre><code>/send @channel https://t.me/channel/123
/send @channel https://t.me/other_channel/123
/send https://t.me/channel/123</code></pre>

<p><b>Private channels:</b> Forward a post from the channel and reply with <code>/id</code> to get its ID, then use:</p>
<pre><code>/send -1001234567890</code></pre>

<p>💡 <b>Tip:</b> You can schedule the <code>/send</code> command to publish automatically at a future time.</p>

<h3>3. Update Posts (/edit)</h3>
<p>Reply to any rendered preview with:</p>
<pre><code>/edit &lt;message-link&gt;</code></pre>
<p><b>Examples:</b></p>
<pre><code>/edit https://t.me/channel/123
/edit https://t.me/c/1234567890/123
/edit @channel 123</code></pre>

<tg-button-row align="center">
  <tg-button type="url" style="primary" url="https://github.com/pxeemo/telegram-article-bot">Open Source on GitHub</tg-button>
</tg-button-row>

<h3>Commands</h3>
<p>• /send — Publish a rendered post to a channel<br/>
• /edit — Update an existing sent post with a rendered post<br/>
• /cheatsheet — Full HTML tags cheatsheet<br/>
• /id — Get chat or forwarded channel ID<br/>
• /help — Show this guide</p>
`;

export async function helpCommand(ctx: BotContext): Promise<void> {
  try {
    await ctx.replyWithRichMessage({
      html: GENERAL_HELP_TEXT.trim(),
    });
  } catch {
    const fallbackText = GENERAL_HELP_TEXT.replace(
      /<tg-button-row[^>]*>[\s\S]*?<\/tg-button-row>/gi,
      '<p><a href="https://github.com/pxeemo/telegram-article-bot">Open Source on GitHub</a></p>'
    ).trim();
    await ctx.reply(fallbackText, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}
