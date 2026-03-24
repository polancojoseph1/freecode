import { describe, expect, it } from "bun:test"
import { base64Decode, base64Encode } from "../src/encode"

describe("base64Encode", () => {
  it("encodes basic ASCII strings correctly", () => {
    expect(base64Encode("hello world")).toBe("aGVsbG8gd29ybGQ")
  })

  it("handles empty strings", () => {
    expect(base64Encode("")).toBe("")
  })

  it("encodes emojis and unicode characters (UTF-8)", () => {
    expect(base64Encode("👋🌍")).toBe("8J-Ri_CfjI0")
    expect(base64Encode("你好")).toBe("5L2g5aW9")
  })

  it("replaces '+' with '-' (URL-safe)", () => {
    // "\x00\xBE" in standard base64 is "AMK+"
    expect(base64Encode("\x00\xBE")).toBe("AMK-")
    // "hello?" in base64url is "aGVsbG8_" but standard is "aGVsbG8/"
    // wait, what produces "+"? "ÿ" produces "w78=" -> "w78"
    // Let's use "\x00\xBE" -> "AMK-"
  })

  it("replaces '/' with '_' (URL-safe)", () => {
    // "\x00\xBF" in standard base64 is "AMK/"
    expect(base64Encode("\x00\xBF")).toBe("AMK_")
  })

  it("removes '=' padding", () => {
    // "a" in standard base64 is "YQ=="
    expect(base64Encode("a")).toBe("YQ")
    // "aa" in standard base64 is "YWE="
    expect(base64Encode("aa")).toBe("YWE")
  })
})

describe("base64Decode", () => {
  it("decodes basic ASCII strings correctly", () => {
    expect(base64Decode("aGVsbG8gd29ybGQ")).toBe("hello world")
  })

  it("handles empty strings", () => {
    expect(base64Decode("")).toBe("")
  })

  it("decodes emojis and unicode characters (UTF-8)", () => {
    expect(base64Decode("8J-Ri_CfjI0")).toBe("👋🌍")
    expect(base64Decode("5L2g5aW9")).toBe("你好")
  })
})

describe("base64 roundtrip", () => {
  it("encodes and decodes values correctly", () => {
    const values = [
      "hello world",
      "",
      "👋🌍",
      "你好",
      "\x00\xBE",
      "\x00\xBF",
      "a",
      "aa",
      "hello?",
      "aGVsbG8/YT4=YT8=", // random base64 chars
    ]

    for (const value of values) {
      expect(base64Decode(base64Encode(value))).toBe(value)
    }
  })
})
