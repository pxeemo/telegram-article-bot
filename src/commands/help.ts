import { BotContext } from "../types";

export const GENERAL_HELP_TEXT = `
<h1>📖 Penguins Posts — General Usage Guide</h1>
<p>This bot allows you to compose, preview, and publish rich Telegram articles and messages directly to your channels without forward quoting.</p>

<hr/>

<h3>1. Composing &amp; Previewing Articles</h3>
<p>• <b>Direct Text:</b> Send any HTML text into the chat to preview it as a rich article.</p>
<p>• <b>Template Files:</b> You can upload <code>.html</code> or <code>.txt</code> template files as documents.</p>

<hr/>

<h3>2. Text Direction (RTL / LTR)</h3>
<p>• <b>Automatic:</b> Persian, Arabic, and Hebrew articles are automatically detected and rendered Right-to-Left (RTL).</p>
<p>• <b>Manual Override:</b> Put <code>#rtl</code> or <code>&lt;!-- rtl --&gt;</code> at the very beginning of your template to force RTL, or <code>#ltr</code> to force LTR.</p>

<hr/>

<h3>3. Embedding Media &amp; Files</h3>
<p>Send any <b>photo, video, GIF, audio, or document</b> to this bot. The bot will instantly reply with an exact <code>&lt;img src="tg://photo?id=..."/&gt;</code> code snippet formatted for easy copying!</p>

<hr/>

<h3>4. Publishing to Channels &amp; Sending as Replies</h3>
<p>Reply to any rendered preview output from the bot with:</p>
<pre><code>/send @your_channel</code></pre>

<p><b>Replying to a Specific Post:</b></p>
<p>Copy the post link in Telegram (tap/right-click post &rarr; <i>Copy Link</i>) and send:</p>
<pre><code>/send @your_channel https://t.me/your_channel/123</code></pre>
<p>• <b>Cross-channel replies:</b> You can also reply to posts from another channel:</p>
<pre><code>/send @your_channel https://t.me/other_channel/123</code></pre>
<p>• <b>Shortcut:</b> If publishing to the same channel as the replied post, you can simply use:</p>
<pre><code>/send https://t.me/your_channel/123</code></pre>

<p><b>Private Channels (Numeric ID):</b></p>
<p>For private channels without a public username, publish using their numeric ID starting with <code>-100</code>:</p>
<pre><code>/send -1001234567890</code></pre>
<p><b>How to get your private channel ID:</b></p>
<ul>
  <li><b>Forward a Post:</b> Forward any post from your private channel directly to this bot — the bot will instantly reply with its Chat ID and <code>/send</code> command!</li>
  <li><b>From Post Link:</b> Tap/right-click any post in your channel &rarr; <i>Copy Link</i> (e.g. <code>https://t.me/c/1234567890/42</code>). Prepend <code>-100</code> to the first number to get your channel ID: <code>-1001234567890</code>.</li>
</ul>

<hr/>

<p>💡 <b>Tip — Scheduling Messages:</b> When sending <code>/send</code>, right-click (desktop) or long-press (mobile) the send arrow and choose <b>Schedule message</b> to publish automatically at a future date and time.</p>

<hr/>

<h3>Bot Commands:</h3>
<p>• /help — This general usage guide.<br/>
• /cheatsheet — Full HTML tags cheatsheet with collapsible categories.<br/>
• /id — Get chat or forwarded channel ID.<br/>
• /start — Introduction and welcome message.</p>
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
