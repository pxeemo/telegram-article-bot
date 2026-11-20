import { describe, expect, it } from "bun:test";
import { parseEditLink, convertRichBlocksToInput, parseTelegramMessageLink } from "../src/utils";

describe("parseEditLink", () => {
  it("should parse public telegram message links", () => {
    const res = parseEditLink("https://t.me/my_channel/123");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 123,
    });
  });

  it("should parse public telegram message links without protocol", () => {
    const res = parseEditLink("t.me/my_channel/123");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 123,
    });
  });

  it("should parse private telegram message links", () => {
    const res = parseEditLink("https://t.me/c/1234567890/456");
    expect(res).toEqual({
      targetChat: "-1001234567890",
      messageId: 456,
    });
  });

  it("should parse private forum topic telegram links", () => {
    const res = parseEditLink("https://t.me/c/1234567890/10/789");
    expect(res).toEqual({
      targetChat: "-1001234567890",
      messageId: 789,
    });
  });

  it("should parse public forum topic telegram links", () => {
    const res = parseEditLink("https://t.me/my_channel/10/789");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 789,
    });
  });

  it("should parse slash syntax @channel/123", () => {
    const res = parseEditLink("@my_channel/123");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 123,
    });
  });

  it("should parse slash syntax -1001234567890/123", () => {
    const res = parseEditLink("-1001234567890/123");
    expect(res).toEqual({
      targetChat: "-1001234567890",
      messageId: 123,
    });
  });

  it("should parse space separated syntax @channel 123", () => {
    const res = parseEditLink("@my_channel 123");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 123,
    });
  });

  it("should parse space separated syntax -1001234567890 123", () => {
    const res = parseEditLink("-1001234567890 123");
    expect(res).toEqual({
      targetChat: "-1001234567890",
      messageId: 123,
    });
  });

  it("should ignore query parameters and hashes", () => {
    const res = parseEditLink("https://t.me/my_channel/123?single#top");
    expect(res).toEqual({
      targetChat: "@my_channel",
      messageId: 123,
    });
  });

  it("should return null for invalid or missing messageId", () => {
    expect(parseEditLink("")).toBeNull();
    expect(parseEditLink("https://t.me/my_channel")).toBeNull();
    expect(parseEditLink("invalid text")).toBeNull();
  });
});

describe("convertRichBlocksToInput", () => {
  it("should convert media blocks to input format", () => {
    const blocks = [
      {
        type: "paragraph",
        text: "Hello world",
      },
      {
        type: "photo",
        photo: [
          { file_id: "small_id", width: 100, height: 100 },
          { file_id: "large_id", width: 800, height: 800 },
        ],
      },
      {
        type: "video",
        video: { file_id: "video_id" },
      },
      {
        type: "collage",
        blocks: [
          {
            type: "photo",
            photo: [{ file_id: "photo_1" }],
          },
        ],
      },
    ];

    const converted = convertRichBlocksToInput(blocks);

    expect(converted[0]).toEqual({
      type: "paragraph",
      text: "Hello world",
    });
    expect(converted[1]).toEqual({
      type: "photo",
      photo: { type: "photo", media: "large_id" },
    });
    expect(converted[2]).toEqual({
      type: "video",
      video: { type: "video", media: "video_id" },
    });
    expect(converted[3].blocks[0]).toEqual({
      type: "photo",
      photo: { type: "photo", media: "photo_1" },
    });
  });
});
