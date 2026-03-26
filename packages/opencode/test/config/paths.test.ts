import { test, expect, describe, spyOn, mock, afterEach } from "bun:test"
import { ConfigPaths } from "../../src/config/paths"
import { Filesystem } from "../../src/util/filesystem"

describe("ConfigPaths.readFile", () => {
  afterEach(() => {
    mock.restore()
  })

  test("returns undefined when file is missing (ENOENT)", async () => {
    spyOn(Filesystem, "readText").mockImplementation(async () => {
      const error = new Error("ENOENT: no such file or directory") as NodeJS.ErrnoException
      error.code = "ENOENT"
      throw error
    })

    const result = await ConfigPaths.readFile("nonexistent.json")
    expect(result).toBeUndefined()
  })

  test("throws JsonError when reading fails with non-ENOENT error", async () => {
    const mockError = new Error("EACCES: permission denied") as NodeJS.ErrnoException
    mockError.code = "EACCES"

    spyOn(Filesystem, "readText").mockImplementation(async () => {
      throw mockError
    })

    try {
      await ConfigPaths.readFile("nopermission.json")
      expect.unreachable("Should have thrown")
    } catch (e: any) {
      expect(e.name).toBe("ConfigJsonError")
      expect(e.data.path).toBe("nopermission.json")
      expect(e.cause).toBe(mockError)
    }
  })

  test("returns file content successfully", async () => {
    const mockContent = '{"test": true}'
    spyOn(Filesystem, "readText").mockImplementation(async () => mockContent)

    const result = await ConfigPaths.readFile("existing.json")
    expect(result).toBe(mockContent)
  })
})
