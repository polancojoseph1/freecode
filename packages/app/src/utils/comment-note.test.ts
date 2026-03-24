import { describe, expect, test } from "bun:test"
import { parseCommentNote } from "./comment-note"

describe("parseCommentNote", () => {
  test("parses 'this file'", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding this file of src/index.ts: This is a comment",
    )
    expect(result).toEqual({
      path: "src/index.ts",
      selection: undefined,
      comment: "This is a comment",
    })
  })

  test("parses 'line X'", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding line 42 of src/utils/math.ts: Check this logic",
    )
    expect(result).toEqual({
      path: "src/utils/math.ts",
      selection: {
        startLine: 42,
        startChar: 0,
        endLine: 42,
        endChar: 0,
      },
      comment: "Check this logic",
    })
  })

  test("parses 'lines X through Y'", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding lines 10 through 20 of src/components/Button.tsx: Refactor this component",
    )
    expect(result).toEqual({
      path: "src/components/Button.tsx",
      selection: {
        startLine: 10,
        startChar: 0,
        endLine: 20,
        endChar: 0,
      },
      comment: "Refactor this component",
    })
  })

  test("handles multi-line comments", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding line 5 of package.json: This is a\nmulti-line\ncomment.",
    )
    expect(result).toEqual({
      path: "package.json",
      selection: {
        startLine: 5,
        startChar: 0,
        endLine: 5,
        endChar: 0,
      },
      comment: "This is a\nmulti-line\ncomment.",
    })
  })

  test("returns undefined for non-matching strings", () => {
    const result = parseCommentNote("Just a random comment that doesn't match the format")
    expect(result).toBeUndefined()
  })

  test("returns undefined for slightly incorrect format", () => {
    // Missing "The user made the following comment regarding "
    const result = parseCommentNote("this file of src/index.ts: This is a comment")
    expect(result).toBeUndefined()
  })
})
