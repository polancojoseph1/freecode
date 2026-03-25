import { describe, expect, it } from "bun:test"
import { getFilename, getDirectory } from "../src/path"

describe("path utilities", () => {
  describe("getDirectory", () => {
    it("returns empty string for undefined or empty input", () => {
      expect(getDirectory(undefined)).toBe("")
      expect(getDirectory("")).toBe("")
    })

    it("returns / for a simple filename", () => {
      expect(getDirectory("file.txt")).toBe("/")
    })

    it("handles UNIX-style paths", () => {
      expect(getDirectory("folder/file.txt")).toBe("folder/")
      expect(getDirectory("/root/folder/file.txt")).toBe("/root/folder/")
    })

    it("handles Windows-style paths", () => {
      expect(getDirectory("folder\\file.txt")).toBe("folder/")
      expect(getDirectory("C:\\folder\\file.txt")).toBe("C:/folder/")
    })

    it("handles paths with trailing slashes", () => {
      expect(getDirectory("folder/subfolder/")).toBe("folder/")
      expect(getDirectory("/root/folder/subfolder/")).toBe("/root/folder/")
      expect(getDirectory("folder\\subfolder\\")).toBe("folder/")
    })

    it("handles root paths", () => {
      expect(getDirectory("/")).toBe("/")
      expect(getDirectory("\\")).toBe("/")
    })
  })

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
})