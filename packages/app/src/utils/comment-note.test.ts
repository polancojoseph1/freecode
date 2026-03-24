import { describe, expect, test } from "bun:test"
import { formatCommentNote, parseCommentNote } from "./comment-note"

describe("formatCommentNote", () => {
  test("formats note without selection", () => {
    const result = formatCommentNote({
      path: "src/index.ts",
      comment: "Looks good to me",
    })
    expect(result).toBe("The user made the following comment regarding this file of src/index.ts: Looks good to me")
  })

  test("formats note with single-line selection", () => {
    const result = formatCommentNote({
      path: "src/utils.ts",
      selection: {
        startLine: 10,
        startChar: 0,
        endLine: 10,
        endChar: 5,
      },
      comment: "Is this correct?",
    })
    expect(result).toBe("The user made the following comment regarding line 10 of src/utils.ts: Is this correct?")
  })

  test("formats note with multi-line selection", () => {
    const result = formatCommentNote({
      path: "src/main.ts",
      selection: {
        startLine: 15,
        startChar: 0,
        endLine: 20,
        endChar: 10,
      },
      comment: "Refactor this block",
    })
    expect(result).toBe("The user made the following comment regarding lines 15 through 20 of src/main.ts: Refactor this block")
  })

  test("formats note with reversed multi-line selection", () => {
    const result = formatCommentNote({
      path: "src/main.ts",
      selection: {
        startLine: 20,
        startChar: 10,
        endLine: 15,
        endChar: 0,
      },
      comment: "Refactor this block",
    })
    expect(result).toBe("The user made the following comment regarding lines 15 through 20 of src/main.ts: Refactor this block")
  })
})

describe("parseCommentNote", () => {
  test("parses note without selection", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding this file of src/index.ts: Looks good to me",
    )
    expect(result).toEqual({
      path: "src/index.ts",
      selection: undefined,
      comment: "Looks good to me",
    })
  })

  test("parses note with single-line selection", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding line 10 of src/utils.ts: Is this correct?",
    )
    expect(result).toEqual({
      path: "src/utils.ts",
      selection: {
        startLine: 10,
        startChar: 0,
        endLine: 10,
        endChar: 0,
      },
      comment: "Is this correct?",
    })
  })

  test("parses note with multi-line selection", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding lines 15 through 20 of src/main.ts: Refactor this block",
    )
    expect(result).toEqual({
      path: "src/main.ts",
      selection: {
        startLine: 15,
        startChar: 0,
        endLine: 20,
        endChar: 0,
      },
      comment: "Refactor this block",
    })
  })

  test("parses note with multiline comment", () => {
    const result = parseCommentNote(
      "The user made the following comment regarding this file of src/index.ts: Looks good to me\nAnd another line",
    )
    expect(result).toEqual({
      path: "src/index.ts",
      selection: undefined,
      comment: "Looks good to me\nAnd another line",
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
