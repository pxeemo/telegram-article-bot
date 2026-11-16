import { BotContext } from "../types";
import { MediaGroupItem, buildMediaGroupReply } from "../handlers/media";

/**
 * Handles media group aggregation using an optional Cloudflare KV namespace.
 * Uses individual item keys to avoid concurrent read-modify-write race conditions.
 */
export async function handleMediaGroupWithKv(
  ctx: BotContext,
  kv: KVNamespace,
  mediaGroupId: string,
  item: MediaGroupItem,
  caption?: string
): Promise<void> {
  const chatId = ctx.chat?.id || 0;
  const prefix = `mg:${chatId}:${mediaGroupId}:item:`;
  const itemKey = `${prefix}${item.fileId}`;
  const captionKey = `mg:${chatId}:${mediaGroupId}:caption`;
  const sentKey = `mg:${chatId}:${mediaGroupId}:sent`;

  // 1. Store this item under its own distinct key (prevents race condition overwrite)
  await kv.put(itemKey, JSON.stringify(item), { expirationTtl: 300 });

  if (caption) {
    await kv.put(captionKey, caption, { expirationTtl: 300 });
  }

  // 2. Debounce: wait for other updates in this album to be written to KV
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // 3. List and collect all items saved for this media group
  const listResult = await kv.list({ prefix });
  const items: MediaGroupItem[] = [];

  for (const key of listResult.keys) {
    const val = await kv.get<MediaGroupItem>(key.name, "json");
    if (val) {
      items.push(val);
    }
  }

  // Deduplicate and sort items by messageId
  items.sort((a, b) => a.messageId - b.messageId);

  // If no items found, nothing to send
  if (items.length === 0) return;

  const storedCaption = (await kv.get(captionKey)) || caption;
  const replyHtml = buildMediaGroupReply(items, storedCaption);

  // 4. Leader selection: the update with the highest messageId is designated to send the message
  const isLeader = items[items.length - 1].fileId === item.fileId;

  if (!isLeader) {
    // Non-leaders wait a brief window for the leader to send
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Check if a message was already sent for this album
  const sentData = await kv.get<{ messageId: number }>(sentKey, "json");

  if (sentData?.messageId) {
    // If already sent and we are the leader, update/edit the message to ensure full items
    if (isLeader && ctx.api?.editMessageText) {
      try {
        await ctx.api.editMessageText(chatId, sentData.messageId, replyHtml, {
          parse_mode: "HTML",
        });
      } catch (err: any) {
        if (!err?.description?.includes("message is not modified")) {
          console.warn("Could not edit message:", err?.message);
        }
      }
    }
    return;
  }

  // 5. Send new message and save sentMessageId in KV
  try {
    const sentMsg = await ctx.reply(replyHtml, { parse_mode: "HTML" });
    if (sentMsg?.message_id) {
      await kv.put(
        sentKey,
        JSON.stringify({ messageId: sentMsg.message_id }),
        { expirationTtl: 300 }
      );
    }
  } catch (err) {
    console.error("KV media group send error:", err);
  }
}
