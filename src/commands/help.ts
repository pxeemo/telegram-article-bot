import { BotContext } from "../types";

export const RICH_ARTICLES_CHEATSHEET = `
<h1>📋 Telegram Rich HTML (Articles) Cheatsheet</h1>

<h2>Template Input (Text or HTML File)</h2>
<pre><code>• Send raw HTML directly as a text message, OR
• Upload an .html or .htm document file (ideal for large articles)</code></pre>

<h2>Text Direction (RTL / LTR)</h2>
<pre><code>&lt;!-- 1. Auto-Detection --&gt;
Persian, Arabic, and Hebrew articles are automatically displayed RTL!

&lt;!-- 2. Explicit Directives (Text or File) --&gt;
&lt;!-- rtl --&gt;   or   &lt;!-- ltr --&gt;
#rtl           or   #ltr
&lt;article dir="rtl"&gt;...&lt;/article&gt;</code></pre>

<h2>Headings &amp; Layout</h2>
<pre><code>&lt;h1&gt;Heading 1&lt;/h1&gt;
&lt;h2&gt;Heading 2&lt;/h2&gt;
&lt;h3&gt;Heading 3&lt;/h3&gt;
&lt;h4&gt;Heading 4&lt;/h4&gt;
&lt;h5&gt;Heading 5&lt;/h5&gt;
&lt;h6&gt;Heading 6&lt;/h6&gt;
&lt;p&gt;Paragraph body text&lt;/p&gt;
&lt;hr/&gt;
&lt;footer&gt;Footer note&lt;/footer&gt;
&lt;a name="sec-1"&gt;&lt;/a&gt;
&lt;a href="#sec-1"&gt;Jump to Section&lt;/a&gt;
&lt;tg-reference name="fn1"&gt;Footnote text&lt;/tg-reference&gt;
&lt;a href="#fn1"&gt;[1]&lt;/a&gt;</code></pre>

<h2>Inline Typography</h2>
<pre><code>&lt;b&gt;bold&lt;/b&gt; or &lt;strong&gt;bold&lt;/strong&gt;
&lt;i&gt;italic&lt;/i&gt; or &lt;em&gt;italic&lt;/em&gt;
&lt;u&gt;underline&lt;/u&gt; or &lt;ins&gt;underline&lt;/ins&gt;
&lt;s&gt;strikethrough&lt;/s&gt; or &lt;del&gt;strike&lt;/del&gt;
&lt;mark&gt;highlighted mark&lt;/mark&gt;
&lt;sub&gt;subscript&lt;/sub&gt; and &lt;sup&gt;superscript&lt;/sup&gt;
&lt;tg-spoiler&gt;hidden spoiler&lt;/tg-spoiler&gt;
&lt;code&gt;inline code&lt;/code&gt;</code></pre>

<h2>Links, Emoji &amp; Math</h2>
<pre><code>&lt;a href="https://t.me"&gt;URL link&lt;/a&gt;
&lt;a href="mailto:name@example.com"&gt;Email&lt;/a&gt;
&lt;a href="tel:+123456789"&gt;Phone&lt;/a&gt;
&lt;a href="tg://user?id=12345678"&gt;Mention user&lt;/a&gt;
&lt;tg-emoji emoji-id="5368324170671202286"&gt;👍&lt;/tg-emoji&gt;
&lt;tg-time unix="1762080000" format="wDT"&gt;22:45 tomorrow&lt;/tg-time&gt;
&lt;tg-math&gt;x^2 + y^2&lt;/tg-math&gt;
&lt;tg-math-block&gt;E = mc^2&lt;/tg-math-block&gt;</code></pre>

<h2>Code Blocks</h2>
<pre><code>&lt;pre&gt;code block lines&lt;/pre&gt;
&lt;pre&gt;&lt;code class="language-python"&gt;print("Hello World")&lt;/code&gt;&lt;/pre&gt;</code></pre>

<h2>Lists &amp; Checklists</h2>
<pre><code>&lt;ul&gt;
  &lt;li&gt;Bullet item&lt;/li&gt;
&lt;/ul&gt;

&lt;ol start="1" type="1"&gt;
  &lt;li&gt;Numbered item (types: 1, a, A, i, I)&lt;/li&gt;
&lt;/ol&gt;

&lt;ul&gt;
  &lt;li&gt;&lt;input type="checkbox" checked&gt; Done task&lt;/li&gt;
  &lt;li&gt;&lt;input type="checkbox"&gt; Pending task&lt;/li&gt;
&lt;/ul&gt;</code></pre>

<h2>Quotes &amp; Collapsible Details</h2>
<pre><code>&lt;blockquote&gt;Quote&lt;cite&gt;Author&lt;/cite&gt;&lt;/blockquote&gt;
&lt;blockquote expandable&gt;Long quote...&lt;cite&gt;Author&lt;/cite&gt;&lt;/blockquote&gt;
&lt;aside&gt;Pull quote&lt;cite&gt;Author&lt;/cite&gt;&lt;/aside&gt;
&lt;details&gt;&lt;summary&gt;Click to expand&lt;/summary&gt;Hidden content&lt;/details&gt;
&lt;details open&gt;&lt;summary&gt;Open by default&lt;/summary&gt;Visible content&lt;/details&gt;</code></pre>

<h2>Tables</h2>
<pre><code>&lt;table bordered striped compact&gt;
  &lt;caption&gt;Table Title&lt;/caption&gt;
  &lt;tr&gt;
    &lt;th align="left"&gt;Col A&lt;/th&gt;
    &lt;th align="right"&gt;Col B&lt;/th&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td colspan="1" rowspan="1"&gt;Cell 1&lt;/td&gt;
    &lt;td align="right" valign="middle"&gt;Cell 2&lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;</code></pre>

<h2>Buttons &amp; Button Rows</h2>
<pre><code>&lt;!-- Inline buttons inside paragraphs --&gt;
&lt;p&gt;
  &lt;tg-button type="url" style="primary" url="https://t.me"&gt;Link&lt;/tg-button&gt;
  &lt;tg-button type="copy_text" style="success" text="PROMO2026"&gt;Copy&lt;/tg-button&gt;
&lt;/p&gt;

&lt;!-- Button rows (align: left | center | right) --&gt;
&lt;tg-button-row align="center"&gt;
  &lt;tg-button type="url" style="primary" url="https://t.me"&gt;URL&lt;/tg-button&gt;
  &lt;tg-button type="copy_text" style="success" text="CopyMe"&gt;Copy Code&lt;/tg-button&gt;
  &lt;tg-button type="callback_data" style="link" data="payload_1"&gt;Callback&lt;/tg-button&gt;
  &lt;tg-button type="web_app" style="danger" url="https://example.com"&gt;MiniApp&lt;/tg-button&gt;
  &lt;tg-button type="login_url" url="https://t.me" forward-text="Login" request-write-access&gt;Login&lt;/tg-button&gt;
  &lt;tg-button type="switch_inline_query" query="search"&gt;Share&lt;/tg-button&gt;
  &lt;tg-button type="switch_inline_query_current_chat" query="filter"&gt;Filter&lt;/tg-button&gt;
  &lt;tg-button type="switch_inline_query_chosen_chat" query="q" allow-user-chats allow-bot-chats allow-group-chats allow-channel-chats&gt;Choose&lt;/tg-button&gt;
  &lt;tg-button type="disabled"&gt;Disabled&lt;/tg-button&gt;
&lt;/tg-button-row&gt;
&lt;!-- Styles: primary | secondary | success | danger | link --&gt;</code></pre>

<h2>Media Blocks (Web URLs &amp; Telegram File IDs)</h2>
<pre><code>&lt;!-- Web URLs --&gt;
&lt;img src="https://example.com/pic.jpg"/&gt;
&lt;video src="https://example.com/video.mp4"&gt;&lt;/video&gt;

&lt;!-- Telegram Media (Send photos/videos/files to bot to get their tg:// tags) --&gt;
&lt;img src="tg://photo?id=FILE_ID"/&gt;
&lt;video src="tg://video?id=FILE_ID"&gt;&lt;/video&gt;
&lt;audio src="tg://audio?id=FILE_ID"&gt;&lt;/audio&gt;
&lt;tg-document src="tg://document?id=FILE_ID"&gt;&lt;/tg-document&gt;

&lt;figure&gt;
  &lt;img src="tg://photo?id=FILE_ID" tg-spoiler/&gt;
  &lt;figcaption&gt;Caption &lt;cite&gt;Source&lt;/cite&gt;&lt;/figcaption&gt;
&lt;/figure&gt;

&lt;tg-collage&gt;
  &lt;img src="tg://photo?id=FILE_ID_1"/&gt;
  &lt;img src="tg://photo?id=FILE_ID_2"/&gt;
  &lt;figcaption&gt;Collage caption&lt;/figcaption&gt;
&lt;/tg-collage&gt;

&lt;tg-slideshow&gt;
  &lt;img src="tg://photo?id=FILE_ID_1"/&gt;
  &lt;img src="tg://photo?id=FILE_ID_2"/&gt;
  &lt;figcaption&gt;Slideshow caption&lt;/figcaption&gt;
&lt;/tg-slideshow&gt;
&lt;tg-map lat="41.9028" long="12.4964" zoom="14"/&gt;</code></pre>

<h2>Escaping &amp; Entities</h2>
<pre><code>&amp;amp;lt;   = &lt;
&amp;amp;gt;   = &gt;
&amp;amp;amp;  = &amp;
&amp;amp;quot; = "
&amp;amp;apos; = '
&amp;amp;nbsp; &amp;amp;hellip; &amp;amp;mdash; &amp;amp;ndash; &amp;amp;lsquo; &amp;amp;rsquo; &amp;amp;ldquo; &amp;amp;rdquo;</code></pre>
`;

export async function helpCommand(ctx: BotContext): Promise<void> {
  try {
    await ctx.replyWithRichMessage({
      html: RICH_ARTICLES_CHEATSHEET,
    });
  } catch {
    await ctx.reply(RICH_ARTICLES_CHEATSHEET, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  }
}
