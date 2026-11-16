import { BotContext } from "../types";
import { escapeHtml } from "../utils";

export interface MediaGroupItem {
  messageId: number;
  tag: string;
  mediaType: string;
  fileId: string;
}

/**
 * Builds the response containing both <tg-collage> and <tg-slideshow>.
 */
export function buildMediaGroupReply(
  items: MediaGroupItem[],
  caption?: string
): string {
  const tagsFormatted = items.map((i) => `  ${i.tag}`).join("\n");
  const userCaption = caption ? escapeHtml(caption) : null;
  const collageCaption = userCaption || "Collage caption";
  const slideshowCaption = userCaption || "Slideshow caption";

  const collageSnippet = `<tg-collage>\n${tagsFormatted}\n  <figcaption>${collageCaption}</figcaption>\n</tg-collage>`;
  const slideshowSnippet = `<tg-slideshow>\n${tagsFormatted}\n  <figcaption>${slideshowCaption}</figcaption>\n</tg-slideshow>`;

  return (
    `🖼️ <b>Media Group Received (${items.length} items)!</b>\n\n` +
    `<b>Collage (tap to copy):</b>\n` +
    `<pre><code class="language-html">${escapeHtml(collageSnippet)}</code></pre>\n\n` +
    `<b>Slideshow (tap to copy):</b>\n` +
    `<pre><code class="language-html">${escapeHtml(slideshowSnippet)}</code></pre>\n\n` +
    `💡 <i>Copy and paste either tag directly into your HTML text or template!</i>`
  );
}

/**
 * Handles incoming media (photos, videos, animations, audio, voice)
 * and replies with ready-to-use Telegram HTML article tags:
 * - If MEDIA_GROUP_DO binding is configured and message is part of a media group,
 *   aggregates the album and sends a single message with <tg-collage> and <tg-slideshow>.
 * - Otherwise (or if single media), replies with individual tag and figure snippets.
 */
export async function handleMediaMessage(ctx: BotContext): Promise<void> {
  const msg = ctx.message;
  if (!msg) return;

  const userCaption = msg.caption ? escapeHtml(msg.caption) : null;

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
    const captionHtml = userCaption || "Photo caption <cite>Author</cite>";
    figureSnippet = `<figure>\n  <img src="tg://photo?id=${fileId}"/>\n  <figcaption>${captionHtml}</figcaption>\n</figure>`;
  } else if (msg.video) {
    mediaType = "Video";
    fileId = msg.video.file_id;
    snippet = `<video src="tg://video?id=${fileId}"></video>`;
    const captionHtml = userCaption || "Video caption";
    figureSnippet = `<figure>\n  <video src="tg://video?id=${fileId}"></video>\n  <figcaption>${captionHtml}</figcaption>\n</figure>`;
  } else if (msg.animation) {
    mediaType = "Animation (GIF)";
    fileId = msg.animation.file_id;
    snippet = `<video src="tg://video?id=${fileId}"></video>`;
    const captionHtml = userCaption || "GIF caption";
    figureSnippet = `<figure>\n  <video src="tg://video?id=${fileId}"></video>\n  <figcaption>${captionHtml}</figcaption>\n</figure>`;
  } else if (msg.audio) {
    mediaType = "Audio";
    fileId = msg.audio.file_id;
    snippet = `<audio src="tg://audio?id=${fileId}"></audio>`;
    const captionHtml =
      userCaption || escapeHtml(msg.audio.title || "Audio Track");
    figureSnippet = `<figure>\n  <audio src="tg://audio?id=${fileId}"></audio>\n  <figcaption>${captionHtml}</figcaption>\n</figure>`;
  } else if (msg.voice) {
    mediaType = "Voice Note";
    fileId = msg.voice.file_id;
    snippet = `<audio src="tg://audio?id=${fileId}"></audio>`;
    if (userCaption) {
      figureSnippet = `<figure>\n  <audio src="tg://audio?id=${fileId}"></audio>\n  <figcaption>${userCaption}</figcaption>\n</figure>`;
    }
  }

  if (!fileId) return;

  // Check for media group: if MEDIA_GROUP_DO is configured, aggregate and send once!
  if (msg.media_group_id && ctx.env?.MEDIA_GROUP_DO) {
    const item: MediaGroupItem = {
      messageId: msg.message_id,
      tag: snippet,
      mediaType,
      fileId,
    };

    try {
      const id = ctx.env.MEDIA_GROUP_DO.idFromName(msg.media_group_id);
      const stub = ctx.env.MEDIA_GROUP_DO.get(id);
      await stub.addMediaItem({
        chatId: ctx.chat!.id,
        mediaGroupId: msg.media_group_id,
        item,
        caption: msg.caption,
      });
      return;
    } catch (err) {
      console.error("Error delegating to MEDIA_GROUP_DO:", err);
      // Fallback to individual handling on error
    }
  }

  // Individual media reply (default or fallback)
  const replyHtml =
    `🖼️ <b>${mediaType} Received!</b>\n\n` +
    `<b>Single Tag (tap to copy):</b>\n` +
    `<pre><code class="language-html">${escapeHtml(snippet)}</code></pre>\n\n` +
    (figureSnippet
      ? `<b>Figure with Caption:</b>\n<pre><code class="language-html">${escapeHtml(
          figureSnippet
        )}</code></pre>\n\n`
      : "") +
    `💡 <i>Copy and paste this tag directly into your HTML text or template!</i>`;

  await ctx.reply(replyHtml, { parse_mode: "HTML" });
}
