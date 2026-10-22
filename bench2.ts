import { getDirectory as oldGetDir, getFilename as oldGetFile } from "./packages/util/src/path.ts"

function newGetFile(path: string | undefined) {
  if (!path) return ""
  // Fast path for common case: unix paths without trailing slashes
  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
      const trimmed = path.replace(/[\/\\]+$/, "")
      if (!trimmed) return ""
      const newLastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
      return newLastIndex === -1 ? trimmed : trimmed.slice(newLastIndex + 1)
  }

  return lastIndex === -1 ? path : path.slice(lastIndex + 1)
}

function newGetDir(path: string | undefined) {
  if (!path) return ""
  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
      const trimmed = path.replace(/[\/\\]+$/, "")
      if (!trimmed) return ""
      const newLastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
      return newLastIndex === -1 ? "" : trimmed.slice(0, newLastIndex).replace(/\\/g, "/") + "/"
  }

  if (lastIndex === -1) return ""
  return path.slice(0, lastIndex).replace(/\\/g, "/") + "/"
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
    console.error(`Mismatch for getDir('${p}'): old='${oldGetDir(p)}', new='${newGetDir(p)}'`)
  }
  if (oldGetFile(p) !== newGetFile(p)) {
    console.error(`Mismatch for getFile('${p}'): old='${oldGetFile(p)}', new='${newGetFile(p)}'`)
  }
}

const ITERATIONS = 1000000;
let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (const p of paths) {
    oldGetDir(p);
    oldGetFile(p);
  }
}
let oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (const p of paths) {
    newGetDir(p);
    newGetFile(p);
  }
}
let newTime = performance.now() - start;

console.log(`Old: ${oldTime.toFixed(2)}ms`);
console.log(`New: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
