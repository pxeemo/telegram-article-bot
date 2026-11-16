import { DurableObject } from "cloudflare:workers";
import { Env } from "../types";
import {
  MediaGroupItem,
  buildMediaGroupReply,
  buildSingleMediaReply,
} from "../handlers/media";

interface ChatMediaState {
  chatId: number | string;
  caption?: string;
  items: MediaGroupItem[];
  silenceTimer: any;
  maxWindowTimer: any;
}

/**
 * Cloudflare Durable Object for time-based media aggregation.
 * Keyed by chat ID (one instance per chat).
 * Collects media sent within a time window (e.g. up to 10 items in under a minute),
 * and once silence is detected:
 * - If 1 media was sent: replies with single tag and figure tag.
 * - If multiple media were sent: replies with <tg-collage> and <tg-slideshow>.
 */
export class MediaGroupCoordinator extends DurableObject<Env> {
  private state: ChatMediaState | null = null;
  private waitPromiseResolver: (() => void) | null = null;

  async addMediaItem(params: {
    chatId: number | string;
    item: MediaGroupItem;
  }): Promise<void> {
    if (!this.state) {
      this.state = {
        chatId: params.chatId,
        caption: params.item.caption,
        items: [],
        silenceTimer: null,
        maxWindowTimer: null,
      };

      // Keep Durable Object alive across the debounce window
      if (this.ctx?.waitUntil) {
        this.ctx.waitUntil(
          new Promise<void>((resolve) => {
            this.waitPromiseResolver = resolve;
          })
        );
      }

      // Hard safety timeout: flush after 60 seconds maximum from the first media
      this.state.maxWindowTimer = setTimeout(() => {
        this.flush();
      }, 60000);
    }

    if (params.item.caption && !this.state.caption) {
      this.state.caption = params.item.caption;
    }

    // Deduplicate items by fileId
    const existingIdx = this.state.items.findIndex(
      (i) => i.fileId === params.item.fileId
    );
    if (existingIdx >= 0) {
      this.state.items[existingIdx] = params.item;
    } else {
      this.state.items.push(params.item);
    }
    this.state.items.sort((a, b) => a.messageId - b.messageId);

    // If 10 items reached (Telegram collage limit), flush immediately!
    if (this.state.items.length >= 10) {
      this.flush();
      return;
    }

    // Reset silence debounce timer: wait 3 seconds of silence after the latest media
    if (this.state.silenceTimer) {
      clearTimeout(this.state.silenceTimer);
    }
    this.state.silenceTimer = setTimeout(() => {
      this.flush();
    }, 3000);

    // Return immediately to keep input gates unblocked
  }

  async flush(): Promise<void> {
    if (!this.state || this.state.items.length === 0) {
      this.cleanup();
      return;
    }

    const { chatId, items, caption } = this.state;
    this.cleanup();

    // If only 1 media was sent in the window, offer single tag + figure
    // If multiple media were sent, offer <tg-collage> and <tg-slideshow>
    const replyHtml =
      items.length === 1
        ? buildSingleMediaReply(items[0])
        : buildMediaGroupReply(items, caption);

    const botToken = this.env.BOT_TOKEN;

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyHtml,
          parse_mode: "HTML",
        }),
      });
    } catch (err) {
      console.error("Durable Object media group send error:", err);
    }
  }

  private cleanup(): void {
    if (this.state?.silenceTimer) clearTimeout(this.state.silenceTimer);
    if (this.state?.maxWindowTimer) clearTimeout(this.state.maxWindowTimer);
    this.state = null;
    if (this.waitPromiseResolver) {
      this.waitPromiseResolver();
      this.waitPromiseResolver = null;
    }
  }
}
