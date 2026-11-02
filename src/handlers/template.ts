import { BotContext } from "../types";
import { escapeHtml, processRichTemplate } from "../utils";
import { GrammyError } from "grammy";

/**
 * Shared renderer for Telegram Rich Messages (Articles).
 * Applies RTL detection and directive stripping.
 */
export async function renderRichMessage(
  ctx: BotContext,
  rawContent: string,
  captionHint?: string
): Promise<void> {
  const { html, isRtl } = processRichTemplate(rawContent, captionHint);

  if (!html) {
    await ctx.reply("⚠️ The template is empty. Please provide HTML content.");
    return;
  }

  try {
    await ctx.replyWithRichMessage({
      html,
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
        `• Make sure tags are supported in Telegram Rich Messages (send /help for full cheatsheet).\n` +
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
 * Handles incoming HTML documents (.html, .htm, .txt) and renders their contents.
 */
export async function handleDocumentMessage(ctx: BotContext): Promise<void> {
  const document = ctx.message?.document;
  if (!document) return;

  const fileName = document.file_name?.toLowerCase() || "";
  const mimeType = document.mime_type?.toLowerCase() || "";

  // Check if the uploaded file is an HTML or text file
  const isHtmlFile =
    fileName.endsWith(".html") ||
    fileName.endsWith(".htm") ||
    fileName.endsWith(".txt") ||
    mimeType.includes("html") ||
    mimeType.includes("text");

  if (!isHtmlFile) {
    await ctx.reply(
      `⚠️ <b>Unsupported File Type</b>\n` +
        `Please send an <code>.html</code> or <code>.htm</code> document containing your rich article template.`,
      { parse_mode: "HTML" }
    );
    return;
  }

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
    // Download the document file using Telegram Bot API
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
