import { describe, expect, it } from "bun:test"
import { sampledChecksum, checksum } from "../src/encode"

describe("sampledChecksum", () => {
  it("returns undefined for empty or nullish content", () => {
    expect(sampledChecksum("")).toBeUndefined()
    // @ts-expect-error - testing invalid input
    expect(sampledChecksum(undefined)).toBeUndefined()
    // @ts-expect-error - testing invalid input
    expect(sampledChecksum(null)).toBeUndefined()
  })

  it("returns regular checksum when content length is within the limit", () => {
    const content = "hello world"
    const expected = checksum(content)

    expect(sampledChecksum(content)).toBe(expected)
    expect(sampledChecksum(content, 100)).toBe(expected)
    expect(sampledChecksum(content, content.length)).toBe(expected)
  })

  it("returns sampled checksum when content exceeds the limit", () => {
    // Generate a string longer than our custom limit of 50
    const content = "a".repeat(100)
    const limit = 50

    const result = sampledChecksum(content, limit)

    expect(result).toBeDefined()
    expect(result).not.toBe(checksum(content))

    // The format should be `${length}:${hash1}:${hash2}:${hash3}:${hash4}:${hash5}`
    const parts = result!.split(":")
    expect(parts.length).toBe(6) // length + 5 hashes
    expect(parts[0]).toBe("100")
  })

  it("returns consistent checksums for identical content", () => {
    const content1 = "x".repeat(1000)
    const content2 = "x".repeat(1000)
    const limit = 500

    expect(sampledChecksum(content1, limit)).toBe(sampledChecksum(content2, limit))
  })

  it("returns different checksums if content differs at sampling points", () => {
    // Generate a long string
    const baseContent = "abcdefghijklmnopqrstuvwxyz".repeat(100)
    const limit = 500

    const originalChecksum = sampledChecksum(baseContent, limit)

    // Modify content at the beginning (point 0)
    const modifiedStart = "Z" + baseContent.slice(1)
    expect(sampledChecksum(modifiedStart, limit)).not.toBe(originalChecksum)

    // Modify content at the end
    const modifiedEnd = baseContent.slice(0, -1) + "Z"
    expect(sampledChecksum(modifiedEnd, limit)).not.toBe(originalChecksum)
  })

  it("handles strings where length is greater than limit but smaller than sampling size", () => {
    // size is 4096 in the implementation
    // limit is set below size
    const content = "b".repeat(2000)
    const limit = 1000

    const result = sampledChecksum(content, limit)
    expect(result).toBeDefined()

    const parts = result!.split(":")
    expect(parts.length).toBe(6) // length + 5 hashes
    expect(parts[0]).toBe("2000")
  })
})
