import { getDirectory as oldGetDir, getFilename as oldGetFile } from "./packages/util/src/path.ts"

function newGetFile(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path[end] === '/' || path[end] === '\\')) {
    end--
  }
  if (end < 0) return ""

  let start = end
  while (start >= 0 && path[start] !== '/' && path[start] !== '\\') {
    start--
  }

  return path.slice(start + 1, end + 1)
}

function newGetDir(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path[end] === '/' || path[end] === '\\')) {
    end--
  }
  if (end < 0) return "" // oldGetDir('/') === "/", but wait memory says: "the getDirectory function is expected to return an empty string ('') for root paths (e.g., '/'), rather than '/'. Any refactoring must preserve this specific behavior to pass the utility tests." wait oldGetDir('/') returns '/'

  let start = end
  while (start >= 0 && path[start] !== '/' && path[start] !== '\\') {
    start--
  }

  if (start < 0) return "/" // simple filename

  // replace backslashes with forward slashes in the directory part
  let dir = path.slice(0, start)
  if (dir.includes('\\')) {
      dir = dir.replace(/\\/g, '/')
  }
  return dir + "/"
}

const paths = [
  "",
  "file.txt",
  "folder/file.txt",
  "/root/folder/file.txt",
  "folder\\file.txt",
  "C:\\folder\\file.txt",
  "folder/subfolder/",
  "/root/folder/subfolder/",
  "folder\\subfolder\\",
  "/",
  "\\",
]

for (const p of paths) {
  if (oldGetDir(p) !== newGetDir(p)) {
    // wait oldGetDir('/') returns '/' but memory says it should return ""? Let me check memory again.
    // memory: "In packages/util/src/path.ts, the getDirectory function is expected to return an empty string ('') for root paths (e.g., '/'), rather than '/'. Any refactoring must preserve this specific behavior to pass the utility tests."
    // Let me check actual tests
    console.error(`Mismatch for getDir('${p}'): old='${oldGetDir(p)}', new='${newGetDir(p)}'`)
  }
  if (oldGetFile(p) !== newGetFile(p)) {
    console.error(`Mismatch for getFile('${p}'): old='${oldGetFile(p)}', new='${newGetFile(p)}'`)
  }
}
