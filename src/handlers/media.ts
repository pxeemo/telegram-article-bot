import { BotContext } from "../types";
import { escapeHtml } from "../utils";

export interface MediaGroupItem {
  messageId: number;
  tag: string;
  mediaType: string;
  fileId: string;
  figureSnippet?: string;
  caption?: string;
}

/**
 * Builds the response for a single media item (single tag + figure tag with caption).
 */
export function buildSingleMediaReply(item: MediaGroupItem): string {
  return (
    `🖼️ <b>${item.mediaType} Received!</b>\n\n` +
    `<b>Single Tag (tap to copy):</b>\n` +
    `<pre><code class="language-html">${escapeHtml(item.tag)}</code></pre>\n\n` +
    (item.figureSnippet
      ? `<b>Figure with Caption:</b>\n<pre><code class="language-html">${escapeHtml(
          item.figureSnippet
        )}</code></pre>\n\n`
      : "") +
    `💡 <i>Copy and paste this tag directly into your HTML text or template!</i>`
  );
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
 * - If MEDIA_GROUP_DO binding is configured, aggregates media sent by the chat within the time window.
 *   If only 1 media was sent, replies with single tag + figure.
 *   If multiple media were sent, replies with <tg-collage> and <tg-slideshow>.
 * - If MEDIA_GROUP_DO is not configured, replies immediately per message (fallback mode).
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

  const item: MediaGroupItem = {
    messageId: msg.message_id,
    tag: snippet,
    mediaType,
    fileId,
    figureSnippet,
    caption: msg.caption,
  };

  // If MEDIA_GROUP_DO binding exists, aggregate media by chat over time!
  if (ctx.env?.MEDIA_GROUP_DO && ctx.chat) {
    try {
      const id = ctx.env.MEDIA_GROUP_DO.idFromName(`chat:${ctx.chat.id}`);
      const stub = ctx.env.MEDIA_GROUP_DO.get(id);
      await stub.addMediaItem({
        chatId: ctx.chat.id,
        item,
      });
      return;
    } catch (err) {
      console.error("Error delegating to MEDIA_GROUP_DO:", err);
      // Fallback to immediate reply on error
    }
  }

  // Fallback / individual mode (when MEDIA_GROUP_DO is not configured)
  const replyHtml = buildSingleMediaReply(item);
  await ctx.reply(replyHtml, { parse_mode: "HTML" });
}
