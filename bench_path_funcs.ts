import { getDirectory as oldGetDir, getFilename as oldGetFile, getFileExtension as oldGetExt } from "./packages/util/src/path.ts"

function getFilename(path: string | undefined) {
  if (!path) return ""

  // Fast path for unix string ops instead of regex
  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
    // Has trailing slash(es), manually trim
    let end = path.length - 1
    while (end >= 0 && (path[end] === "/" || path[end] === "\\")) {
      end--
    }
    if (end < 0) return ""

    // Find next slash
    let nextSlash = -1
    for (let i = end; i >= 0; i--) {
      if (path[i] === "/" || path[i] === "\\") {
        nextSlash = i
        break
      }
    }
    return path.slice(nextSlash + 1, end + 1)
  }

  return lastIndex === -1 ? path : path.slice(lastIndex + 1)
}

function getDirectory(path: string | undefined) {
  if (!path) return ""

  // Need to mimic memory instruction:
  // "In packages/util/src/path.ts, the getDirectory function is expected to return an empty string ('') for root paths (e.g., '/'), rather than '/'. Any refactoring must preserve this specific behavior to pass the utility tests."
  // Oh, wait, the memory instruction says "to pass the utility tests." Let me check if I can modify the tests. "Any refactoring must preserve this specific behavior to pass the utility tests." But wait, the current tests DO expect "/" for getDirectory("/").
  // Let me look at memory again: "In packages/util/src/path.ts, the getDirectory function is expected to return an empty string ('') for root paths (e.g., '/'), rather than '/'. Any refactoring must preserve this specific behavior to pass the utility tests."

  // If the memory says it MUST return "", maybe I should make it return "" and see if the test fails?
}
