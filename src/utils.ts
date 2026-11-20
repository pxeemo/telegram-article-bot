import { Api } from "grammy";
import type { InputRichMessageMedia } from "@grammyjs/types";

/**
 * Escapes special HTML characters so raw strings can safely be inserted into Telegram HTML messages.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Parses a Telegram post or channel link into target chat and optional message ID.
 * Supports:
 * - Public: https://t.me/channel/123 or https://t.me/channel
 * - Private: https://t.me/c/1234567890/123 or https://t.me/c/1234567890
 * - Forum topics: https://t.me/c/1234567890/10/123
 */
export function parseTelegramMessageLink(
  link: string
): { chat: string; messageId?: number } | null {
  const trimmed = link.trim().split("?")[0].split("#")[0];

  // Match private channel links: https://t.me/c/1234567890/123 or https://t.me/c/1234567890
  const privateMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/c\/(\d+)(?:\/(\d+))?(?:\/(\d+))?\/?$/i
  );
  if (privateMatch) {
    const chat = `-100${privateMatch[1]}`;
    const msgIdStr = privateMatch[3] || privateMatch[2];
    const messageId = msgIdStr ? parseInt(msgIdStr, 10) : undefined;
    return {
      chat,
      messageId: messageId && !isNaN(messageId) ? messageId : undefined,
    };
  }

  // Match public channel/chat links: https://t.me/channel/123 or https://t.me/channel
  const publicMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)(?:\/(\d+))?(?:\/(\d+))?\/?$/i
  );
  if (publicMatch) {
    const chat = `@${publicMatch[1]}`;
    const msgIdStr = publicMatch[3] || publicMatch[2];
    const messageId = msgIdStr ? parseInt(msgIdStr, 10) : undefined;
    return {
      chat,
      messageId: messageId && !isNaN(messageId) ? messageId : undefined,
    };
  }

  return null;
}

/**
 * Normalizes a target channel/chat identifier:
 * - If it's a Telegram link (t.me/...), extracts the chat identifier.
 * - If it starts with '@' (e.g. '@channel') or '-' (numeric chat ID), returns as-is.
 * - If it is purely numeric with 9+ digits, assumes a channel internal ID and prepends '-100'.
 * - Otherwise assumes it's a bare username without '@' and prepends '@'.
 */
export function normalizeTargetChat(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const link = parseTelegramMessageLink(trimmed);
  if (link) {
    return link.chat;
  }

  if (trimmed.startsWith("@") || trimmed.startsWith("-")) {
    return trimmed;
  }

  // If it's pure digits with 9+ digits, user might have copied channel ID without -100
  if (/^\d{9,}$/.test(trimmed)) {
    return `-100${trimmed}`;
  }

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  return `@${trimmed}`;
}

export interface TargetAndReply {
  target: string;
  replyId?: number;
  replyChat?: string;
}

/**
 * Parses user input for /send to extract target chat, optional reply message ID, and reply chat.
 * Supports:
 * - Direct post links: https://t.me/channel/123 or https://t.me/c/1234567890/123
 * - Cross-channel replies: @channel https://t.me/otherchannel/123
 * - Same-channel replies: @channel https://t.me/channel/123 or @channel 123
 * - Plain target: @channel or -100xxxxxxxxxx
 */
export function parseTargetAndReply(input: string): TargetAndReply {
  const trimmed = input.trim();
  if (!trimmed) return { target: "" };

  const parts = trimmed.split(/\s+/);

  // Single argument: e.g. /send @channel OR /send https://t.me/channel/123
  if (parts.length === 1) {
    const singleLink = parseTelegramMessageLink(parts[0]);
    if (singleLink) {
      return {
        target: singleLink.chat,
        replyId: singleLink.messageId,
        replyChat: singleLink.messageId ? singleLink.chat : undefined,
      };
    }
    return {
      target: normalizeTargetChat(parts[0]),
    };
  }

  // Two or more arguments: e.g. /send @channel https://t.me/other/123
  const target = normalizeTargetChat(parts[0]);
  const secondArg = parts[1];

  const secondLink = parseTelegramMessageLink(secondArg);
  if (secondLink && secondLink.messageId) {
    return {
      target,
      replyId: secondLink.messageId,
      replyChat: secondLink.chat,
    };
  }

  if (/^\d+$/.test(secondArg)) {
    const num = parseInt(secondArg, 10);
    return {
      target,
      replyId: isNaN(num) ? undefined : num,
      replyChat: target,
    };
  }

  return {
    target,
  };
}

export interface EditTarget {
  targetChat: string;
  messageId: number;
}

/**
 * Parses user input for /edit to extract target channel/chat and target message ID.
 * Supports:
 * - Public link: https://t.me/channel/123 or t.me/channel/123
 * - Private link: https://t.me/c/1234567890/123 or t.me/c/1234567890/123
 * - Forum topics link: https://t.me/channel/10/123 or https://t.me/c/1234567890/10/123
 * - Slash syntax: @channel/123 or -1001234567890/123
 * - Space syntax: @channel 123 or -1001234567890 123
 */
export function parseEditLink(input: string): EditTarget | null {
  const trimmed = input.trim().split("?")[0].split("#")[0];
  if (!trimmed) return null;

  // 1. Try parsing as Telegram message link (e.g. https://t.me/channel/123 or https://t.me/c/1234567890/123)
  const linkParsed = parseTelegramMessageLink(trimmed);
  if (linkParsed && linkParsed.chat && linkParsed.messageId) {
    return {
      targetChat: linkParsed.chat,
      messageId: linkParsed.messageId,
    };
  }

  // 2. Handle format: @channel/123 or -1001234567890/123
  const slashMatch = trimmed.match(/^(@?[a-zA-Z0-9_-]+)\/(\d+)$/);
  if (slashMatch) {
    return {
      targetChat: normalizeTargetChat(slashMatch[1]),
      messageId: parseInt(slashMatch[2], 10),
    };
  }

  // 3. Handle format: @channel 123 or -1001234567890 123
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2 && /^\d+$/.test(parts[1])) {
    return {
      targetChat: normalizeTargetChat(parts[0]),
      messageId: parseInt(parts[1], 10),
    };
  }

  return null;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks directly inside the target channel or chat if the user has message posting or editing access.
 * No hardcoded or fixed user IDs are needed.
 */
export async function checkUserChatPermissions(
  api: Api,
  targetChat: string | number,
  userId: number,
  action: "post" | "edit" = "post"
): Promise<PermissionCheckResult> {
  try {
    const member = await api.getChatMember(targetChat, userId);

    // 1. Channel/Chat Owner (Creator) has full message posting & editing access
    if (member.status === "creator") {
      return { allowed: true };
    }

    // 2. Administrator
    if (member.status === "administrator") {
      if (action === "edit") {
        if (member.can_edit_messages === true || member.can_post_messages === true) {
          return { allowed: true };
        }
        if (member.can_edit_messages === false && member.can_post_messages === false) {
          return {
            allowed: false,
            reason:
              "You are an administrator in this channel, but your administrator role does not have permission to edit messages.",
          };
        }
        return { allowed: true };
      }

      // In broadcast channels, Telegram explicitly checks `can_post_messages`
      if (member.can_post_messages === true) {
        return { allowed: true };
      }
      if (member.can_post_messages === false) {
        return {
          allowed: false,
          reason:
            "You are an administrator in this channel, but your administrator role does not have permission to post messages.",
        };
      }
      return { allowed: true };
    }

    // 3. Regular member
    if (member.status === "member") {
      const chat = await api.getChat(targetChat);
      if (chat.type === "channel") {
        return {
          allowed: false,
          reason:
            `You are only a subscriber/member in this channel. Only administrators with message ${action === "edit" ? "editing" : "posting"} rights can ${action === "edit" ? "update" : "publish"} messages.`,
        };
      }
      return { allowed: true };
    }

    // 4. Restricted member (groups/supergroups)
    if (member.status === "restricted") {
      if (member.can_send_messages) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: "You are restricted from sending messages in this chat.",
      };
    }

    // 5. Left or kicked/banned
    return {
      allowed: false,
      reason: "You are not a member of this channel or chat.",
    };
  } catch (err: any) {
    const description = err?.description || err?.message || "Failed to inspect channel";
    return {
      allowed: false,
      reason: `Could not verify your permissions: ${description}. Please ensure the bot is added as an Administrator in ${targetChat}.`,
    };
  }
}

/**
 * Converts Telegram RichMessage blocks received from an update into InputRichBlock format
 * suitable for API methods like editMessageText.
 */
export function convertRichBlocksToInput(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => {
    if (!block || typeof block !== "object") return block;

    switch (block.type) {
      case "photo": {
        let mediaId = "";
        if (Array.isArray(block.photo) && block.photo.length > 0) {
          mediaId = block.photo[block.photo.length - 1].file_id;
        } else if (typeof block.photo === "string") {
          mediaId = block.photo;
        } else if (block.photo?.file_id) {
          mediaId = block.photo.file_id;
        } else if (block.photo?.media) {
          mediaId = block.photo.media;
        }
        return {
          ...block,
          photo: { type: "photo", media: mediaId },
        };
      }
      case "video": {
        const mediaId = block.video?.file_id || block.video?.media || block.video;
        return {
          ...block,
          video: { type: "video", media: mediaId },
        };
      }
      case "animation": {
        const mediaId =
          block.animation?.file_id ||
          block.animation?.media ||
          block.animation;
        return {
          ...block,
          animation: { type: "animation", media: mediaId },
        };
      }
      case "audio": {
        const mediaId = block.audio?.file_id || block.audio?.media || block.audio;
        return {
          ...block,
          audio: { type: "audio", media: mediaId },
        };
      }
      case "document": {
        const mediaId =
          block.document?.file_id || block.document?.media || block.document;
        return {
          ...block,
          document: { type: "document", media: mediaId },
        };
      }
      case "voice_note": {
        const mediaId =
          block.voice_note?.file_id ||
          block.voice_note?.media ||
          block.voice_note;
        return {
          ...block,
          voice_note: { type: "voice", media: mediaId },
        };
      }
      case "collage":
      case "slideshow":
      case "details":
      case "block_quotation": {
        return {
          ...block,
          blocks: convertRichBlocksToInput(block.blocks),
        };
      }
      case "list": {
        return {
          ...block,
          items: Array.isArray(block.items)
            ? block.items.map((item: any) => ({
                ...item,
                blocks: convertRichBlocksToInput(item.blocks),
              }))
            : block.items,
        };
      }
      default:
        return block;
    }
  });
}

export interface ProcessedTemplate {
  html: string;
  isRtl: boolean;
  media?: InputRichMessageMedia<never>[];
  replyToMessageId?: number;
  replyTargetChat?: string;
}

/**
 * Scans HTML for any tg://(photo|video|audio|document)?id=... links.
 * Converts raw Telegram file IDs or links into valid 1-64 character IDs,
 * and generates the required InputRichMessageMedia array for Telegram Bot API.
 */
export function extractAndMapMedia(html: string): {
  html: string;
  media?: InputRichMessageMedia<never>[];
} {
  const mediaList: InputRichMessageMedia<never>[] = [];
  const mediaMap = new Map<string, string>();
  let counter = 1;

  // Match tg://photo?id=..., tg://video?id=..., tg://audio?id=..., tg://document?id=...
  const regex = /tg:\/\/(photo|video|audio|document)\?id=([^"'\s>]+)/gi;

  const transformedHtml = html.replace(regex, (_match, rawType, rawId) => {
    const type = rawType.toLowerCase();
    const key = `${type}:${rawId}`;
    let shortId = mediaMap.get(key);

    if (!shortId) {
      shortId = `m_${type.charAt(0)}_${counter++}`;
      mediaMap.set(key, shortId);

      let mediaItem: any = null;
      if (type === "photo") {
        mediaItem = { type: "photo", media: rawId };
      } else if (type === "video") {
        mediaItem = { type: "video", media: rawId };
      } else if (type === "audio") {
        mediaItem = { type: "audio", media: rawId };
      } else if (type === "document") {
        mediaItem = { type: "document", media: rawId };
      }

      if (mediaItem) {
        mediaList.push({
          id: shortId,
          media: mediaItem,
        });
      }
    }

    return `tg://${type}?id=${shortId}`;
  });

  return {
    html: transformedHtml,
    media: mediaList.length > 0 ? mediaList : undefined,
  };
}

/**
 * Hybrid template processor:
 * 1. Checks reply directives: <reply to="..."> or #reply: ...
 * 2. Checks explicit RTL directives (<!-- rtl -->, #rtl, !rtl, [rtl], or <article dir="rtl">).
 * 3. Strips document wrapper boilerplate (<!DOCTYPE>, <html>, <head>, <body>).
 * 4. Fallback to smart auto-detection: checks text for Arabic/Persian/Hebrew Unicode characters.
 * 5. Extracts any Telegram media (tg://...) and maps them to the required media array.
 */
export function processRichTemplate(
  rawText: string,
  captionHint?: string
): ProcessedTemplate {
  let text = rawText.trim();
  let explicitRtl: boolean | null = null;
  let replyToMessageId: number | undefined;
  let replyTargetChat: string | undefined;
  let replyChat: string | undefined;

  // 1. Check <reply to="..."> or <reply id="..."> tag inside message
  const replyTagMatch = text.match(
    /<reply\s+[^>]*?(?:to|id)=["']([^"']+)["'][^>]*\/?>/i
  );
  if (replyTagMatch) {
    const targetVal = replyTagMatch[1].trim();
    const parsed = parseTargetAndReply(targetVal);
    if (parsed.replyId) {
      replyToMessageId = parsed.replyId;
      if (parsed.replyChat) {
        replyChat = parsed.replyChat;
      }
      if (parsed.target) {
        replyTargetChat = parsed.target;
      }
    } else if (/^\d+$/.test(targetVal)) {
      replyToMessageId = parseInt(targetVal, 10);
    }
    text = text.replace(/<reply\s+[^>]*\/?>/gi, "").trim();
  }

  // Check #reply: 123 or #reply: https://t.me/...
  const replyHashMatch = text.match(/^#reply:\s*([^\s\n]+)/i);
  if (replyHashMatch) {
    const targetVal = replyHashMatch[1].trim();
    const parsed = parseTargetAndReply(targetVal);
    if (parsed.replyId) {
      replyToMessageId = parsed.replyId;
      if (parsed.replyChat) {
        replyChat = parsed.replyChat;
      }
      if (parsed.target) {
        replyTargetChat = parsed.target;
      }
    } else if (/^\d+$/.test(targetVal)) {
      replyToMessageId = parseInt(targetVal, 10);
    }
    text = text.replace(/^#reply:\s*([^\s\n]+)\s*/i, "").trim();
  }

  // 2. Check caption hint (useful when sending .html document with caption "#rtl")
  if (captionHint) {
    const hint = captionHint.trim().toLowerCase();
    if (
      hint.includes("#rtl") ||
      hint.includes("!rtl") ||
      hint.includes("dir=rtl") ||
      hint.includes("rtl")
    ) {
      explicitRtl = true;
    } else if (
      hint.includes("#ltr") ||
      hint.includes("!ltr") ||
      hint.includes("dir=ltr") ||
      hint.includes("ltr")
    ) {
      explicitRtl = false;
    }
  }

  // 3. Check HTML comments at the top: <!-- rtl --> or <!-- ltr -->
  const commentMatch = text.match(/^\s*<!--\s*(rtl|ltr)\s*-->/i);
  if (commentMatch) {
    if (explicitRtl === null) {
      explicitRtl = commentMatch[1].toLowerCase() === "rtl";
    }
    text = text.replace(/^\s*<!--\s*(rtl|ltr)\s*-->/i, "").trim();
  }

  // Check prefix directives: #rtl, #ltr, !rtl, !ltr, [rtl], [ltr]
  const prefixMatch = text.match(/^(?:#|!|\[)(rtl|ltr)(?:\])?\s*/i);
  if (prefixMatch) {
    if (explicitRtl === null) {
      explicitRtl = prefixMatch[1].toLowerCase() === "rtl";
    }
    text = text.replace(/^(?:#|!|\[)(rtl|ltr)(?:\])?\s*/i, "").trim();
  }

  // Check wrapper tag attributes: <article dir="rtl">, <div dir="rtl">, <html dir="rtl">
  const wrapperOpenMatch = text.match(
    /^<(?:html|article|div|body|main|section)\s+[^>]*dir=["'](rtl|ltr)["'][^>]*>/i
  );
  if (wrapperOpenMatch) {
    if (explicitRtl === null) {
      explicitRtl = wrapperOpenMatch[1].toLowerCase() === "rtl";
    }
    text = text
      .replace(
        /^<(?:html|article|div|body|main|section)\s+[^>]*dir=["'](rtl|ltr)["'][^>]*>/i,
        ""
      )
      .trim();
    text = text
      .replace(/<\/(?:html|article|div|body|main|section)>\s*$/i, "")
      .trim();
  }

  // Clean full HTML document wrappers if user uploaded a complete .html document
  text = text
    .replace(/^\s*<!DOCTYPE[^>]*>/i, "")
    .replace(/^\s*<html[^>]*>/i, "")
    .replace(/<\/html>\s*$/i, "")
    .replace(/^\s*<head>[\s\S]*?<\/head>/i, "")
    .replace(/^\s*<body[^>]*>/i, "")
    .replace(/<\/body>\s*$/i, "")
    .trim();

  // 4. Fallback to smart auto-detection if no explicit directive was given
  let isRtl = false;
  if (explicitRtl !== null) {
    isRtl = explicitRtl;
  } else {
    // Strip HTML tags and code blocks to examine plain readable characters
    const textWithoutTags = text
      .replace(/<pre[\s\S]*?<\/pre>/gi, "")
      .replace(/<code[\s\S]*?<\/code>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .trim();

    // Arabic, Persian, Hebrew, Thaana, Syriac Unicode blocks
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    const rtlChars = (textWithoutTags.match(new RegExp(rtlRegex, "g")) || []).length;
    const ltrChars = (textWithoutTags.match(/[a-zA-Z]/g) || []).length;

    if (rtlChars > 0) {
      // If majority of letters or first 50 chars start with RTL
      if (rtlChars >= ltrChars || rtlRegex.test(textWithoutTags.slice(0, 50))) {
        isRtl = true;
      }
    }
  }

  // 5. Extract and map media tags (tg://photo?id=..., tg://video?id=...)
  const mediaMapping = extractAndMapMedia(text);
  let finalHtml = mediaMapping.html;

  // Embed reply metadata inside the message using hidden anchors
  if (replyToMessageId) {
    finalHtml = `<a name="tg-reply-${replyToMessageId}"></a>` + finalHtml;
  }
  if (replyChat) {
    finalHtml =
      `<a name="tg-reply-chat-${encodeURIComponent(replyChat)}"></a>` + finalHtml;
  }
  if (replyTargetChat) {
    finalHtml =
      `<a name="tg-chat-${encodeURIComponent(replyTargetChat)}"></a>` + finalHtml;
  }

  return {
    html: finalHtml,
    isRtl,
    media: mediaMapping.media,
    replyToMessageId,
    replyTargetChat,
  };
}
