import { expect, test, describe } from "bun:test"
import { checksum } from "../src/encode"

describe("checksum", () => {
  test("returns undefined for empty strings", () => {
    expect(checksum("")).toBeUndefined()
  })

  test("generates consistent checksums for identical strings", () => {
    const input = "hello world"
    expect(checksum(input)).toBe(checksum(input))
  })

  test("generates different checksums for different strings", () => {
    expect(checksum("hello world")).not.toBe(checksum("hello world!"))
  })

  test("generates different checksums for same strings with different casing", () => {
    expect(checksum("hello world")).not.toBe(checksum("Hello world"))
  })

  test("generates expected known checksum values", () => {
    // The implementation is a variation of FNV-1a.
    // Let's ensure the output is stable by asserting against a known value.
    expect(checksum("hello world")).toBe("1n91413")
    expect(checksum("The quick brown fox jumps over the lazy dog")).toBe("19kn80")
    expect(checksum("testing123")).toBe("fcbnpx")
  })

  test("handles special characters and unicode", () => {
    // Test that strings with special characters yield a result and are consistent
    const input1 = "こんにちは世界" // Japanese for Hello World
    expect(typeof checksum(input1)).toBe("string")
    expect(checksum(input1)).toBe(checksum(input1))

    const input2 = "🌟🚀" // Emojis
    expect(typeof checksum(input2)).toBe("string")
    expect(checksum(input2)).toBe(checksum(input2))
  })

  test("handles long strings consistently", () => {
    const longString = "a".repeat(10000)
    expect(typeof checksum(longString)).toBe("string")
    expect(checksum(longString)).toBe(checksum(longString))
  })
})
