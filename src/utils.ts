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
 * Normalizes a target channel/chat identifier:
 * - If it starts with '@' (e.g. '@channel') or '-' (numeric chat ID), returns as-is.
 * - If it is purely numeric, returns as-is.
 * - If it's a bare username without '@', prepends '@'.
 */
export function normalizeTargetChat(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("@") || trimmed.startsWith("-")) {
    return trimmed;
  }

  // If it's purely digits, it might be a positive chat ID
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise assume it's a channel/group username
  return `@${trimmed}`;
}

export interface TargetAndReply {
  target: string;
  replyId?: number;
}

/**
 * Parses user input for /send to extract target chat and optional reply message ID.
 * Supports:
 * - Telegram post URLs: https://t.me/channel/123 or https://t.me/c/123456789/123
 * - Space-separated: @channel 123
 * - Plain channel: @channel or -100xxxxxxxxxx
 */
export function parseTargetAndReply(input: string): TargetAndReply {
  const trimmed = input.trim();
  if (!trimmed) return { target: "" };

  // 1. Check if input contains a Telegram post link:
  // e.g. https://t.me/mychannel/456 or https://t.me/c/1234567890/456
  const linkMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?t\.me\/(?:c\/(\d+)|([a-zA-Z0-9_]+))\/(\d+)/i
  );
  if (linkMatch) {
    const isPrivate = !!linkMatch[1];
    const targetChat = isPrivate ? `-100${linkMatch[1]}` : `@${linkMatch[2]}`;
    const replyId = parseInt(linkMatch[3], 10);
    return {
      target: targetChat,
      replyId: isNaN(replyId) ? undefined : replyId,
    };
  }

  // 2. Check space-separated format: @channel 123 or -1001234567890 123
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const target = normalizeTargetChat(parts[0]);
    // Check if second part is a number or link
    const secondPart = parts[1];
    const subLinkMatch = secondPart.match(/\/(\d+)$/);
    let replyId: number | undefined;

    if (subLinkMatch) {
      replyId = parseInt(subLinkMatch[1], 10);
    } else if (/^\d+$/.test(secondPart)) {
      replyId = parseInt(secondPart, 10);
    }

    return {
      target,
      replyId: replyId && !isNaN(replyId) ? replyId : undefined,
    };
  }

  return {
    target: normalizeTargetChat(trimmed),
    replyId: undefined,
  };
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks directly inside the target channel or chat if the user has message posting access.
 * No hardcoded or fixed user IDs are needed.
 */
export async function checkUserChatPermissions(
  api: Api,
  targetChat: string | number,
  userId: number
): Promise<PermissionCheckResult> {
  try {
    const member = await api.getChatMember(targetChat, userId);

    // 1. Channel/Chat Owner (Creator) has full message posting access
    if (member.status === "creator") {
      return { allowed: true };
    }

    // 2. Administrator
    if (member.status === "administrator") {
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
            "You are only a subscriber/member in this channel. Only administrators with message posting rights can publish messages.",
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

  // 1. Check <reply to="..."> or <reply id="..."> tag inside message
  const replyTagMatch = text.match(
    /<reply\s+[^>]*?(?:to|id)=["']([^"']+)["'][^>]*\/?>/i
  );
  if (replyTagMatch) {
    const targetVal = replyTagMatch[1].trim();
    const parsed = parseTargetAndReply(targetVal);
    if (parsed.replyId) {
      replyToMessageId = parsed.replyId;
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
