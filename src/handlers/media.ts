import { BotContext } from "../types";
import { escapeHtml } from "../utils";

/**
 * Handles incoming media (photos, videos, animations, audio, voice)
 * and replies with ready-to-use Telegram HTML article tags.
 */
export async function handleMediaMessage(ctx: BotContext): Promise<void> {
  const msg = ctx.message;
  if (!msg) return;

  let mediaType = "";
  let fileId = "";
  let snippet = "";
  let figureSnippet = "";

  if (msg.photo && msg.photo.length > 0) {
    // Get highest resolution photo (last element in array)
    const photo = msg.photo[msg.photo.length - 1];
    mediaType = "Photo";
    fileId = photo.file_id;
    snippet = `<img src="tg://photo?id=${fileId}"/>`;
    figureSnippet = `<figure>\n  <img src="tg://photo?id=${fileId}"/>\n  <figcaption>Photo caption <cite>Author</cite></figcaption>\n</figure>`;
  } else if (msg.video) {
    mediaType = "Video";
    fileId = msg.video.file_id;
    snippet = `<video src="tg://video?id=${fileId}"></video>`;
    figureSnippet = `<figure>\n  <video src="tg://video?id=${fileId}"></video>\n  <figcaption>Video caption</figcaption>\n</figure>`;
  } else if (msg.animation) {
    mediaType = "Animation (GIF)";
    fileId = msg.animation.file_id;
    snippet = `<video src="tg://video?id=${fileId}"></video>`;
    figureSnippet = `<figure>\n  <video src="tg://video?id=${fileId}"></video>\n  <figcaption>GIF caption</figcaption>\n</figure>`;
  } else if (msg.audio) {
    mediaType = "Audio";
    fileId = msg.audio.file_id;
    snippet = `<audio src="tg://audio?id=${fileId}"></audio>`;
    figureSnippet = `<figure>\n  <audio src="tg://audio?id=${fileId}"></audio>\n  <figcaption>${escapeHtml(
      msg.audio.title || "Audio Track"
    )}</figcaption>\n</figure>`;
  } else if (msg.voice) {
    mediaType = "Voice Note";
    fileId = msg.voice.file_id;
    snippet = `<audio src="tg://audio?id=${fileId}"></audio>`;
  }

  if (!fileId) return;

  const replyHtml =
    `🖼️ <b>${mediaType} Received!</b>\n\n` +
    `<b>Single Tag (tap to copy):</b>\n` +
    `<pre><code>${escapeHtml(snippet)}</code></pre>\n\n` +
    (figureSnippet
      ? `<b>Figure with Caption:</b>\n<pre><code>${escapeHtml(
          figureSnippet
        )}</code></pre>\n\n`
      : "") +
    `💡 <i>Copy and paste this tag directly into your HTML text or template!</i>`;

  await ctx.reply(replyHtml, { parse_mode: "HTML" });
}
