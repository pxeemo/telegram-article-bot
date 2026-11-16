import { DurableObject } from "cloudflare:workers";
import { Env } from "../types";
import { MediaGroupItem, buildMediaGroupReply } from "../handlers/media";

interface MediaGroupState {
  chatId: number | string;
  mediaGroupId: string;
  caption?: string;
  items: MediaGroupItem[];
  sentMessageId?: number;
  timer?: any;
  resolvers: Array<() => void>;
}

/**
 * Cloudflare Durable Object for handling media group aggregation.
 * Since a Durable Object is guaranteed to be a single in-memory instance for a given ID,
 * concurrent webhook updates for the same album are processed in the same memory heap.
 */
export class MediaGroupCoordinator extends DurableObject<Env> {
  private buffer: MediaGroupState | null = null;

  async addMediaItem(params: {
    chatId: number | string;
    mediaGroupId: string;
    item: MediaGroupItem;
    caption?: string;
  }): Promise<void> {
    if (!this.buffer) {
      this.buffer = {
        chatId: params.chatId,
        mediaGroupId: params.mediaGroupId,
        caption: params.caption,
        items: [],
        resolvers: [],
      };
    }

    if (params.caption && !this.buffer.caption) {
      this.buffer.caption = params.caption;
    }

    const existingIdx = this.buffer.items.findIndex(
      (i) => i.fileId === params.item.fileId
    );
    if (existingIdx >= 0) {
      this.buffer.items[existingIdx] = params.item;
    } else {
      this.buffer.items.push(params.item);
    }
    this.buffer.items.sort((a, b) => a.messageId - b.messageId);

    // Reset debounce timer
    if (this.buffer.timer) {
      clearTimeout(this.buffer.timer);
    }

    this.buffer.timer = setTimeout(async () => {
      await this.flush();
    }, 1200);

    // Keep request alive until debounce flushes
    await new Promise<void>((resolve) => {
      this.buffer?.resolvers.push(resolve);
    });
  }

  async flush(): Promise<void> {
    if (!this.buffer || this.buffer.items.length === 0) return;

    const { chatId, items, caption, sentMessageId, resolvers } = this.buffer;
    const replyHtml = buildMediaGroupReply(items, caption);
    const botToken = this.env.BOT_TOKEN;

    const resolveAll = () => {
      for (const res of resolvers) {
        try {
          res();
        } catch {}
      }
      if (this.buffer) {
        this.buffer.resolvers = [];
      }
    };

    try {
      if (sentMessageId) {
        // Edit existing message
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/editMessageText`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: sentMessageId,
              text: replyHtml,
              parse_mode: "HTML",
            }),
          }
        );
        const data: any = await res.json();
        if (data.ok) return;
      }

      // Send new message
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyHtml,
            parse_mode: "HTML",
          }),
        }
      );
      const data: any = await res.json();
      if (data.ok && data.result?.message_id) {
        if (this.buffer) {
          this.buffer.sentMessageId = data.result.message_id;
        }
      }
    } catch (err) {
      console.error("Durable Object media group flush error:", err);
    } finally {
      resolveAll();
    }
  }
}
