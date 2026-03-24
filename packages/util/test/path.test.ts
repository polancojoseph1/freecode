import { describe, it, expect } from "bun:test"
import { getDirectory } from "../src/path"

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
})
