import { BotContext } from "../types";

export const RICH_ARTICLES_CHEATSHEET = `
<h1>📋 Telegram Rich HTML Cheatsheet</h1>
<p>Tap any section below to expand its HTML tags and code snippets:</p>

<hr/>

<details>
  <summary><b>1. Template Input &amp; Text Direction (RTL / LTR)</b></summary>
  <p><b>Input Methods:</b></p>
  <pre><code>• Send raw HTML directly in chat, OR
• Upload a .txt or .html file containing HTML</code></pre>
  <p><b>RTL Direction:</b></p>
  <p>Persian, Arabic, and Hebrew articles are automatically rendered RTL. To explicitly override text direction, add one of these at the top of your text or file:</p>
  <pre><code>#rtl
#ltr
&lt;article dir="rtl"&gt;...&lt;/article&gt;</code></pre>
</details>

<details>
  <summary><b>2. Headings &amp; Document Structure</b></summary>
  <p><b>Headings (h1 to h6):</b></p>
  <pre><code>&lt;h1&gt;Heading 1&lt;/h1&gt;
&lt;h2&gt;Heading 2&lt;/h2&gt;
&lt;h3&gt;Heading 3&lt;/h3&gt;
&lt;h4&gt;Heading 4&lt;/h4&gt;
&lt;h5&gt;Heading 5&lt;/h5&gt;
&lt;h6&gt;Heading 6&lt;/h6&gt;</code></pre>
  <p><b>Paragraphs, Dividers &amp; Footers:</b></p>
  <pre><code>&lt;p&gt;Paragraph body text&lt;/p&gt;
&lt;hr/&gt;
&lt;footer&gt;Footer note&lt;/footer&gt;</code></pre>
  <p><b>In-Document Anchors &amp; References:</b></p>
  <pre><code>&lt;a name="sec-1"&gt;&lt;/a&gt;
&lt;a href="#sec-1"&gt;Jump to Section 1&lt;/a&gt;
&lt;tg-reference name="fn1"&gt;Footnote text&lt;/tg-reference&gt;
&lt;a href="#fn1"&gt;[1]&lt;/a&gt;</code></pre>
</details>

<details>
  <summary><b>3. Typography &amp; Inline Styles</b></summary>
  <pre><code>&lt;b&gt;bold&lt;/b&gt; or &lt;strong&gt;bold&lt;/strong&gt;
&lt;i&gt;italic&lt;/i&gt; or &lt;em&gt;italic&lt;/em&gt;
&lt;u&gt;underline&lt;/u&gt; or &lt;ins&gt;underline&lt;/ins&gt;
&lt;s&gt;strikethrough&lt;/s&gt; or &lt;del&gt;strike&lt;/del&gt;
&lt;mark&gt;highlighted mark&lt;/mark&gt;
&lt;sub&gt;subscript&lt;/sub&gt; and &lt;sup&gt;superscript&lt;/sup&gt;
&lt;tg-spoiler&gt;hidden spoiler&lt;/tg-spoiler&gt;
&lt;code&gt;inline code&lt;/code&gt;</code></pre>
</details>

<details>
  <summary><b>4. Links, Mentions, Emoji &amp; Math</b></summary>
  <p><b>Links and Mentions:</b></p>
  <pre><code>&lt;a href="https://t.me"&gt;URL link&lt;/a&gt;
&lt;a href="mailto:name@example.com"&gt;Email&lt;/a&gt;
&lt;a href="tel:+123456789"&gt;Phone&lt;/a&gt;
&lt;a href="tg://user?id=12345678"&gt;Mention user&lt;/a&gt;</code></pre>
  <p><b>Custom Emoji &amp; Localized Dates:</b></p>
  <pre><code>&lt;tg-emoji emoji-id="5368324170671202286"&gt;👍&lt;/tg-emoji&gt;
&lt;tg-time unix="1762080000" format="wDT"&gt;22:45 tomorrow&lt;/tg-time&gt;</code></pre>
  <p><b>LaTeX Math Formulas:</b></p>
  <pre><code>&lt;tg-math&gt;x^2 + y^2&lt;/tg-math&gt;
&lt;tg-math-block&gt;E = mc^2&lt;/tg-math-block&gt;</code></pre>
</details>

<details>
  <summary><b>5. Code Blocks</b></summary>
  <pre><code>&lt;pre&gt;code block lines&lt;/pre&gt;
&lt;pre&gt;&lt;code class="language-python"&gt;print("Hello World")&lt;/code&gt;&lt;/pre&gt;</code></pre>
</details>

<details>
  <summary><b>6. Lists &amp; Interactive Checklists</b></summary>
  <p><b>Bullet and Numbered Lists:</b></p>
  <pre><code>&lt;ul&gt;
  &lt;li&gt;Bullet item&lt;/li&gt;
&lt;/ul&gt;

&lt;ol start="1" type="1"&gt;
  &lt;li&gt;Numbered item (types: 1, a, A, i, I)&lt;/li&gt;
&lt;/ol&gt;</code></pre>
  <p><b>Interactive Task Checklists:</b></p>
  <pre><code>&lt;ul&gt;
  &lt;li&gt;&lt;input type="checkbox" checked&gt; Done task&lt;/li&gt;
  &lt;li&gt;&lt;input type="checkbox"&gt; Pending task&lt;/li&gt;
&lt;/ul&gt;</code></pre>
</details>

<details>
  <summary><b>7. Quotes &amp; Collapsible Details</b></summary>
  <pre><code>&lt;blockquote&gt;Quote&lt;cite&gt;Author&lt;/cite&gt;&lt;/blockquote&gt;
&lt;blockquote expandable&gt;Long quote...&lt;cite&gt;Author&lt;/cite&gt;&lt;/blockquote&gt;
&lt;aside&gt;Pull quote&lt;cite&gt;Author&lt;/cite&gt;&lt;/aside&gt;
&lt;details&gt;&lt;summary&gt;Click to expand&lt;/summary&gt;Hidden content&lt;/details&gt;
&lt;details open&gt;&lt;summary&gt;Open by default&lt;/summary&gt;Visible content&lt;/details&gt;</code></pre>
</details>

<details>
  <summary><b>8. Tables</b></summary>
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
</details>

<details>
  <summary><b>9. Buttons &amp; Button Rows</b></summary>
  <p><b>Inline Button in Paragraph:</b></p>
  <pre><code>&lt;p&gt;
  &lt;tg-button type="url" style="primary" url="https://t.me"&gt;Link&lt;/tg-button&gt;
  &lt;tg-button type="copy_text" style="success" text="PROMO2026"&gt;Copy&lt;/tg-button&gt;
&lt;/p&gt;</code></pre>
  <p><b>Button Rows (align: left, center, right):</b></p>
  <pre><code>&lt;tg-button-row align="center"&gt;
  &lt;tg-button type="url" style="primary" url="https://t.me"&gt;URL&lt;/tg-button&gt;
  &lt;tg-button type="copy_text" style="success" text="CopyMe"&gt;Copy Code&lt;/tg-button&gt;
  &lt;tg-button type="callback_data" style="link" data="payload_1"&gt;Callback&lt;/tg-button&gt;
  &lt;tg-button type="web_app" style="danger" url="https://example.com"&gt;MiniApp&lt;/tg-button&gt;
  &lt;tg-button type="login_url" url="https://t.me" forward-text="Login" request-write-access&gt;Login&lt;/tg-button&gt;
  &lt;tg-button type="switch_inline_query" query="search"&gt;Share&lt;/tg-button&gt;
  &lt;tg-button type="disabled"&gt;Disabled&lt;/tg-button&gt;
&lt;/tg-button-row&gt;</code></pre>
  <p>Button styles: primary, secondary, success, danger, link.</p>
</details>

<details>
  <summary><b>10. Media Blocks (Web URLs &amp; Telegram Files)</b></summary>
  <p><b>Web URLs:</b></p>
  <pre><code>&lt;img src="https://example.com/pic.jpg"/&gt;
&lt;video src="https://example.com/video.mp4"&gt;&lt;/video&gt;</code></pre>
  <p><b>Telegram Media (send photos/videos/files to bot to get tags):</b></p>
  <pre><code>&lt;img src="tg://photo?id=FILE_ID"/&gt;
&lt;video src="tg://video?id=FILE_ID"&gt;&lt;/video&gt;
&lt;audio src="tg://audio?id=FILE_ID"&gt;&lt;/audio&gt;
&lt;tg-document src="tg://document?id=FILE_ID"&gt;&lt;/tg-document&gt;</code></pre>
  <p><b>Figure, Collage &amp; Slideshow:</b></p>
  <pre><code>&lt;figure&gt;
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
</details>

<details>
  <summary><b>11. Character Escaping &amp; Entities</b></summary>
  <pre><code>&amp;amp;lt;   = &lt;
&amp;amp;gt;   = &gt;
&amp;amp;amp;  = &amp;
&amp;amp;quot; = "
&amp;amp;apos; = '
&amp;amp;nbsp; &amp;amp;hellip; &amp;amp;mdash; &amp;amp;ndash; &amp;amp;lsquo; &amp;amp;rsquo; &amp;amp;ldquo; &amp;amp;rdquo;</code></pre>
</details>
`;

export async function cheatsheetCommand(ctx: BotContext): Promise<void> {
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
