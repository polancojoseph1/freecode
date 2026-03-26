import { test, expect, describe, afterEach } from "bun:test"
import { ConfigPaths } from "../../src/config/paths"
import { tmpdir } from "../fixture/fixture"
import path from "path"
import { Filesystem } from "../../src/util/filesystem"

describe("ConfigPaths.parseText", () => {
  test("parses simple JSON", async () => {
    const text = `{"key": "value"}`
    const result = await ConfigPaths.parseText(text, "test.json")
    expect(result).toEqual({ key: "value" })
  })

  test("parses JSONC with comments and trailing commas", async () => {
    const text = `{
      // This is a comment
      "key": "value",
      "array": [1, 2, 3,] // trailing comma
    }`
    const result = await ConfigPaths.parseText(text, "test.jsonc")
    expect(result).toEqual({ key: "value", array: [1, 2, 3] })
  })

  test("throws JsonError on syntax errors with detailed message", async () => {
    const text = `{
      "key": "value",
      "broken":
    }`

    await expect(ConfigPaths.parseText(text, "test.json")).rejects.toThrow(ConfigPaths.JsonError)

    try {
      await ConfigPaths.parseText(text, "test.json")
    } catch (e: any) {
      expect(e.data.message).toContain("ValueExpected at line 4, column 5")
      expect(e.data.message).toContain("--- JSONC Input ---")
      expect(e.data.message).toContain("--- Errors ---")
    }
  })

  describe("environment variable substitution", () => {
    afterEach(() => {
      delete process.env["TEST_VAR"]
      delete process.env["TEST_VAR1"]
      delete process.env["TEST_VAR2"]
    })

    test("substitutes existing environment variables", async () => {
      process.env["TEST_VAR"] = "test-value"
      const text = `{"key": "{env:TEST_VAR}"}`
      const result = await ConfigPaths.parseText(text, "test.json")
      expect(result).toEqual({ key: "test-value" })
    })

    test("substitutes missing environment variables with empty string", async () => {
      const text = `{"key": "{env:TEST_VAR_MISSING}"}`
      const result = await ConfigPaths.parseText(text, "test.json")
      expect(result).toEqual({ key: "" })
    })

    test("substitutes multiple environment variables in same string", async () => {
      process.env["TEST_VAR1"] = "val1"
      process.env["TEST_VAR2"] = "val2"
      const text = `{"key": "{env:TEST_VAR1}-{env:TEST_VAR2}"}`
      const result = await ConfigPaths.parseText(text, "test.json")
      expect(result).toEqual({ key: "val1-val2" })
    })
  })

  describe("file inclusion substitution", () => {
    test("substitutes file contents", async () => {
      await using tmp = await tmpdir()
      const filePath = path.join(tmp.path, "included.txt")
      await Filesystem.write(filePath, "file-content")

      const text = `{"key": "{file:included.txt}"}`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      expect(result).toEqual({ key: "file-content" })
    })

    test("substitutes file contents with multiline text", async () => {
      await using tmp = await tmpdir()
      const filePath = path.join(tmp.path, "included.txt")
      await Filesystem.write(filePath, "line1\\nline2\\nline3")

      const text = `{"key": "{file:included.txt}"}`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      expect(result).toEqual({ key: "line1\\nline2\\nline3" })
    })

    test("trims file contents whitespace", async () => {
      await using tmp = await tmpdir()
      const filePath = path.join(tmp.path, "included.txt")
      await Filesystem.write(filePath, "  padded content  \n")

      const text = `{"key": "{file:included.txt}"}`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      expect(result).toEqual({ key: "padded content" })
    })

    test("ignores file inclusion syntax inside comments", async () => {
      await using tmp = await tmpdir()

      const text = `{
        // {file:missing.txt}
        "key": "value"
      }`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      expect(result).toEqual({ key: "value" })
    })

    test("handles missing file with missing='error' (default)", async () => {
      await using tmp = await tmpdir()

      const text = `{"key": "{file:nonexistent.txt}"}`

      await expect(
        ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      ).rejects.toThrow(ConfigPaths.InvalidError)

      try {
        await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path })
      } catch (e: any) {
        expect(e.data.message).toContain('bad file reference: "{file:nonexistent.txt}"')
      }
    })

    test("handles missing file with missing='empty'", async () => {
      await using tmp = await tmpdir()

      const text = `{"key": "{file:nonexistent.txt}"}`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: tmp.path }, "empty")
      expect(result).toEqual({ key: "" })
    })

    test("resolves absolute file paths", async () => {
      await using tmp = await tmpdir()
      const filePath = path.join(tmp.path, "included.txt")
      await Filesystem.write(filePath, "absolute-content")

      const text = `{"key": "{file:${filePath.replace(/\\/g, "\\\\")}}"}`
      const result = await ConfigPaths.parseText(text, { source: "test.json", dir: "/some/other/dir" })
      expect(result).toEqual({ key: "absolute-content" })
    })
  })
})
