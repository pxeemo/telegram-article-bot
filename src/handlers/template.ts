import { BotContext } from "../types";
import { escapeHtml, processRichTemplate } from "../utils";
import { GrammyError } from "grammy";

/**
 * Shared renderer for Telegram Rich Messages (Articles).
 * Applies RTL detection, document boilerplate cleanup, and Telegram media mapping.
 */
export async function renderRichMessage(
  ctx: BotContext,
  rawContent: string,
  captionHint?: string
): Promise<void> {
  const { html, isRtl, media } = processRichTemplate(rawContent, captionHint);

  if (!html) {
    await ctx.reply("⚠️ The template is empty. Please provide HTML content.");
    return;
  }

  try {
    await ctx.replyWithRichMessage({
      html,
      media,
      is_rtl: isRtl,
    });
  } catch (error: any) {
    const errorMsg =
      error instanceof GrammyError
        ? error.description
        : error?.message || "Invalid Rich HTML template";

    await ctx.reply(
      `❌ <b>Telegram Rich Message (Article) Error:</b>\n` +
        `<code>${escapeHtml(errorMsg)}</code>\n\n` +
        `💡 <b>Troubleshooting:</b>\n` +
        `• Make sure tags are supported in Telegram Rich Messages (send /cheatsheet for full list).\n` +
        `• Ensure all tags are properly closed and nested.\n` +
        `• Unescaped <code>&lt;</code>, <code>&gt;</code>, or <code>&amp;</code> in plain text must be escaped as <code>&amp;lt;</code>, <code>&amp;gt;</code>, and <code>&amp;amp;</code>.`,
      { parse_mode: "HTML" }
    );
  }
}

/**
 * Handles incoming text messages and renders them using the Rich Messages API.
 */
export async function handleTextMessage(ctx: BotContext): Promise<void> {
  const text = ctx.message?.text;
  if (!text) return;

  // Ignore bot commands (handled by command listeners)
  if (text.startsWith("/")) return;

  await renderRichMessage(ctx, text);
}

/**
 * Handles incoming documents:
 * - If template/text file (.html, .htm, .txt, .md, etc.):
 *   1. Sends the media snippet tag so the user can embed the file if needed.
 *   2. Parses and renders the rich article preview.
 * - If other file (PDF, ZIP, image, etc.): generates an embeddable <tg-document> snippet for articles.
 */
export async function handleDocumentMessage(ctx: BotContext): Promise<void> {
  const document = ctx.message?.document;
  if (!document) return;

  const fileName = document.file_name?.toLowerCase() || "";
  const mimeType = document.mime_type?.toLowerCase() || "";

  // Check if the uploaded file is an HTML or text template file
  const isTemplateFile =
    fileName.endsWith(".html") ||
    fileName.endsWith(".htm") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".text") ||
    fileName.endsWith(".tmpl") ||
    fileName.endsWith(".article") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    mimeType.includes("html") ||
    mimeType.startsWith("text/");

  const fileId = document.file_id;
  const snippet = `<tg-document src="tg://document?id=${fileId}"></tg-document>`;
  const figureSnippet = `<figure>\n  <tg-document src="tg://document?id=${fileId}"></tg-document>\n  <figcaption>${escapeHtml(
    document.file_name || "Attachment"
  )} <cite>Download</cite></figcaption>\n</figure>`;

  // For non-template files, provide the embeddable snippet
  if (!isTemplateFile) {
    await ctx.reply(
      `📄 <b>File Received (${escapeHtml(document.file_name || "Document")})!</b>\n\n` +
        `<b>Tag for your Article (tap to copy):</b>\n` +
        `<pre><code>${escapeHtml(snippet)}</code></pre>\n\n` +
        `<b>Figure with Caption:</b>\n` +
        `<pre><code>${escapeHtml(figureSnippet)}</code></pre>\n\n` +
        `💡 <i>Copy and paste this tag inside your HTML text or template!</i>`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // For HTML / template files:
  // 1. Send the file media snippet (so it can also be embedded as a downloadable attachment)
  await ctx.reply(
    `📄 <b>Template File Received (${escapeHtml(document.file_name || "File")})!</b>\n\n` +
      `<b>Tag to embed as file attachment (tap to copy):</b>\n` +
      `<pre><code>${escapeHtml(snippet)}</code></pre>\n\n` +
      `<i>Parsing and rendering article preview below... 👇</i>`,
    { parse_mode: "HTML" }
  );

  // Telegram rich messages have a 32,768 character limit; check reasonable file size
  if (document.file_size && document.file_size > 512 * 1024) {
    await ctx.reply(
      `⚠️ <b>File too large:</b> Telegram Rich Messages support up to 32,768 characters (~32KB). Your file is ${Math.round(
        document.file_size / 1024
      )}KB.`,
      { parse_mode: "HTML" }
    );
    return;
  }

  try {
    // 2. Download and render the parsed post
    const file = await ctx.getFile();
    if (!file.file_path) {
      throw new Error("Unable to obtain file download path from Telegram.");
    }

    const downloadUrl = `https://api.telegram.org/file/bot${ctx.env.BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file (${response.statusText})`);
    }

    const fileContent = await response.text();
    await renderRichMessage(ctx, fileContent, ctx.message?.caption);
  } catch (error: any) {
    await ctx.reply(
      `❌ <b>Error processing document:</b>\n<code>${escapeHtml(
        error?.message || "Failed to download and render document"
      )}</code>`,
      { parse_mode: "HTML" }
    );
  }
}
