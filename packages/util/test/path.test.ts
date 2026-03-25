import { describe, expect, it } from "bun:test"
import { getFilename } from "../src/path"

describe("getFilename", () => {
  it("handles null or undefined inputs", () => {
    // @ts-expect-error - testing invalid inputs
    expect(getFilename(null)).toBe("")
    expect(getFilename(undefined)).toBe("")
  })

  it("handles empty strings", () => {
    expect(getFilename("")).toBe("")
  })

  it("extracts filename from basic paths", () => {
    expect(getFilename("file.txt")).toBe("file.txt")
    expect(getFilename("/path/to/file.txt")).toBe("file.txt")
    expect(getFilename("C:\\path\\to\\file.txt")).toBe("file.txt")
  })

  it("handles trailing slashes", () => {
    expect(getFilename("/path/to/dir/")).toBe("dir")
    expect(getFilename("C:\\path\\to\\dir\\")).toBe("dir")
    expect(getFilename("/path/to/dir///")).toBe("dir")
    expect(getFilename("C:\\path\\to\\dir\\\\\\")).toBe("dir")
  })

  it("handles different path separators", () => {
    expect(getFilename("foo/bar")).toBe("bar")
    expect(getFilename("foo\\bar")).toBe("bar")
    expect(getFilename("foo/bar\\baz")).toBe("baz") // Mixed separators
    expect(getFilename("foo\\bar/baz")).toBe("baz") // Mixed separators
  })

  it("handles filenames with multiple dots", () => {
    expect(getFilename("archive.tar.gz")).toBe("archive.tar.gz")
    expect(getFilename("/path/to/archive.tar.gz")).toBe("archive.tar.gz")
    expect(getFilename(".hiddenfile")).toBe(".hiddenfile")
    expect(getFilename("/path/to/.hiddenfile")).toBe(".hiddenfile")
  })

  it("handles paths with no filename component", () => {
    expect(getFilename("/")).toBe("")
    expect(getFilename("\\")).toBe("")
    expect(getFilename("///")).toBe("")
    expect(getFilename("\\\\\\")).toBe("")
  })
})
