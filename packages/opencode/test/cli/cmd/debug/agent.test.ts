import { describe, expect, it } from "bun:test"
import { parseToolParams } from "../../../../src/cli/cmd/debug/agent"

describe("parseToolParams", () => {
  it("should return an empty object for empty or undefined input", () => {
    expect(parseToolParams()).toEqual({})
    expect(parseToolParams("")).toEqual({})
    expect(parseToolParams("   ")).toEqual({})
  })

  it("should parse valid JSON", () => {
    expect(parseToolParams('{"key": "value"}')).toEqual({ key: "value" })
    expect(parseToolParams('{"nested": {"test": 123}}')).toEqual({ nested: { test: 123 } })
  })

  it("should throw an error for invalid JSON (e.g. unquoted keys)", () => {
    expect(() => parseToolParams('{key: "value"}')).toThrow(/Failed to parse --params\. Use valid JSON\./)
  })

  it("should throw an error for non-object JSON", () => {
    expect(() => parseToolParams("[]")).toThrow("Tool params must be an object.")
    expect(() => parseToolParams('"string"')).toThrow("Tool params must be an object.")
    expect(() => parseToolParams("123")).toThrow("Tool params must be an object.")
  })

  it("should NOT execute arbitrary code (no command injection)", () => {
    // This would throw a ReferenceError (or evaluate to something) in the old `new Function` logic.
    // In our new logic, it will just fail to parse as JSON.
    expect(() => parseToolParams('process.exit(1)')).toThrow(/Failed to parse --params\. Use valid JSON\./)
  })
})
