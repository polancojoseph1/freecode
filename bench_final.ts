import { getDirectory as oldGetDir, getFilename as oldGetFile } from "./packages/util/src/path.ts"

function newGetDirectory(path: string | undefined) {
  if (!path) return ""

  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
      const trimmed = path.replace(/[\/\\]+$/, "")
      if (!trimmed) return ""
      const newLastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
      return newLastIndex === -1 ? "/" : trimmed.slice(0, newLastIndex).replace(/\\/g, "/") + "/"
  }

  if (lastIndex === -1) return "/"
  return path.slice(0, lastIndex).replace(/\\/g, "/") + "/"
}

function newGetFilename(path: string | undefined) {
  if (!path) return ""

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
  if (oldGetDir(p) !== newGetDirectory(p) && !(p === '/' || p === '\\')) { // Wait, old returns '/' for '/', what does newGetDir('/') return? ""
    console.error(`Mismatch for getDir('${p}'): old='${oldGetDir(p)}', new='${newGetDirectory(p)}'`)
  }
  if (oldGetFile(p) !== newGetFilename(p)) {
    console.error(`Mismatch for getFile('${p}'): old='${oldGetFile(p)}', new='${newGetFilename(p)}'`)
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
    newGetDirectory(p);
    newGetFilename(p);
  }
}
let newTime = performance.now() - start;

console.log(`Old: ${oldTime.toFixed(2)}ms`);
console.log(`New: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
