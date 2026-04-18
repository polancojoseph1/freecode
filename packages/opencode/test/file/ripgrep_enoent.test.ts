import { describe, expect, test } from "bun:test"
import { Ripgrep } from "../../src/file/ripgrep"
import path from "path"

describe("file.ripgrep ENOENT handling", () => {
  test("returns empty array instead of throwing when cwd is missing", async () => {
    const cwd = path.join(process.cwd(), "non_existent_dir_12345")
    const files = await Array.fromAsync(Ripgrep.files({ cwd }))
    expect(files).toEqual([])
  })
})
