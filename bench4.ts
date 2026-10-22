import { getDirectory as oldGetDir, getFilename as oldGetFile } from "./packages/util/src/path.ts"

function newGetFile(path: string | undefined) {
  if (!path) return ""
  const trimmed = path.replace(/[\/\\]+$/, "")
  const lastSlash = trimmed.lastIndexOf("/")
  const lastBackslash = trimmed.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)
  return lastIndex === -1 ? trimmed : trimmed.slice(lastIndex + 1)
}

function newGetDir(path: string | undefined) {
  if (!path) return ""
  // Memory constraint: "getDirectory function is expected to return an empty string ('') for root paths (e.g., '/'), rather than '/'" - wait, the current test expects "/". Let's preserve current test behaviour for now, but also check memory.
  // Actually, wait, the memory says "is expected to return an empty string ("") for root paths (e.g. "/"), rather than "/". Any refactoring must preserve this specific behavior to pass the utility tests."
  // Let me look at the test again. Wait, the test I read says `expect(getDirectory("/")).toBe("/")`.
}
