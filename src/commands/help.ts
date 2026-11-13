import { BotContext } from "../types";

export const GENERAL_HELP_TEXT = `
<h1>📖 Penguins Posts — General Usage Guide</h1>
<p>This bot allows you to compose, preview, and publish rich Telegram articles and messages directly to your channels without forward quoting.</p>

<hr/>

<h3>1. Composing &amp; Previewing Articles</h3>
<p>• <b>Direct Text:</b> Send any HTML text into the chat to preview it as a rich article.</p>
<p>• <b>Template Files:</b> You can upload a template file. <i>Tip:</i> Telegram clients often block uploading <code>.html</code> files for security reasons — simply rename your file to <code>.txt</code> (e.g. <code>post.txt</code>) and send it as a document!</p>

<hr/>

<h3>2. Text Direction (RTL / LTR)</h3>
<p>• <b>Automatic:</b> Persian, Arabic, and Hebrew articles are automatically detected and rendered Right-to-Left (RTL).</p>
<p>• <b>Manual Override:</b> Put <code>#rtl</code> or <code><!-- rtl --></code> at the very beginning of your template to force RTL, or <code>#ltr</code> to force LTR.</p>

<hr/>

<h3>3. Embedding Media &amp; Files</h3>
<p>Send any <b>photo, video, GIF, audio, or document</b> to this bot. The bot will instantly reply with an exact <code>&lt;img src="tg://photo?id=..."/&gt;</code> code snippet that you can copy and paste into your template!</p>

<hr/>

<h3>4. Publishing to Channels (/send)</h3>
<p>Reply to any rendered preview output from the bot with:</p>
<pre><code>/send @your_channel</code></pre>
<p>or using numeric chat ID:</p>
<pre><code>/send -1001234567890</code></pre>
<p><b>Permission Check:</b> The bot verifies directly inside the target channel that you are the channel Owner or an Administrator with "Post Messages" permission. The message is then copied cleanly without any "Forwarded from" headers.</p>

<hr/>

<h3>5. How to Schedule Messages</h3>
<p>You can schedule channel posts using Telegram's built-in message scheduler:</p>
<ol>
  <li>Reply to the bot's rendered article with <code>/send @your_channel</code>.</li>
  <li><b>Desktop:</b> Right-click the send button (arrow) and select <b>"Schedule message..."</b>.</li>
  <li><b>Mobile (iOS / Android):</b> Long-press the send button (arrow) and select <b>"Schedule message"</b>.</li>
  <li>Pick your desired date and time.</li>
</ol>
<p>Telegram will hold the command and automatically send it to the bot at the exact scheduled moment. The bot will verify permissions and post the article to your channel on time!</p>

<hr/>

<h3>Bot Commands:</h3>
<p>• <code>/help</code> — This general usage guide.<br/>
• <code>/cheatsheet</code> — Full HTML tags cheatsheet with collapsible categories.<br/>
• <code>/id</code> — Show your Telegram User ID and Chat ID.<br/>
• <code>/start</code> — Introduction and welcome message.</p>
`;

export async function helpCommand(ctx: BotContext): Promise<void> {
  try {
    await ctx.replyWithRichMessage({
      html: GENERAL_HELP_TEXT,
    });
  } catch {
    await ctx.reply(GENERAL_HELP_TEXT, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}
