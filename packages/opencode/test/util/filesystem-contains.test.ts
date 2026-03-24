import { describe, test, expect } from "bun:test"
import path from "path"
import fs from "fs/promises"
import { Filesystem } from "../../src/util/filesystem"
import { tmpdir } from "../fixture/fixture"

describe("Filesystem.contains symlink escape", () => {
  test("detects lexical escape via symlink to external directory", async () => {
    await using project = await tmpdir()
    await using external = await tmpdir()

    const linkPath = path.join(project.path, "external_link")
    await fs.symlink(external.path, linkPath)

    const escapedPath = path.join(linkPath, "secret.txt")

    // Should now correctly identify the escape through the symlink
    expect(Filesystem.contains(project.path, escapedPath)).toBe(false)
  })

  test("detects escape via symlink for non-existent child", async () => {
    await using project = await tmpdir()
    await using external = await tmpdir()

    const linkPath = path.join(project.path, "external_link")
    await fs.symlink(external.path, linkPath)

    const nonExistentEscapedPath = path.join(linkPath, "non-existent.txt")

    // Should correctly identify the escape even for non-existent files
    expect(Filesystem.contains(project.path, nonExistentEscapedPath)).toBe(false)
  })

  test("detects cross-drive escape (simulated by absolute path)", () => {
    // On Windows, if we have C:\project and we check D:\other,
    // path.relative('C:\\project', 'D:\\other') returns 'D:\\other' (an absolute path)

    const projectPath = process.platform === 'win32' ? 'C:\\project' : '/project';
    const otherDrivePath = process.platform === 'win32' ? 'D:\\other' : '/other';

    // Filesystem.contains should always be false for cross-drive paths or different roots
    expect(Filesystem.contains(projectPath, otherDrivePath)).toBe(false);
  })
})
