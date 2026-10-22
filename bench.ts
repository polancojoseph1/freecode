import { getDirectory as oldGetDir, getFilename as oldGetFile } from "./packages/util/src/path.ts"

function newGetFile(path: string | undefined) {
  if (!path) return ""
  const trimmed = path.replace(/[\/\\]+$/, "")
  if (!trimmed) return ""
  const lastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
  return lastIndex === -1 ? trimmed : trimmed.slice(lastIndex + 1)
}

function newGetDir(path: string | undefined) {
  if (!path) return ""
  const trimmed = path.replace(/[\/\\]+$/, "")
  if (!trimmed) return "/"

  const lastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
  if (lastIndex === -1) return "/"
  return trimmed.slice(0, lastIndex).replace(/\\/g, "/") + "/"
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
    console.error(`Mismatch for getDir(${p}): old=${oldGetDir(p)}, new=${newGetDir(p)}`)
  }
  if (oldGetFile(p) !== newGetFile(p)) {
    console.error(`Mismatch for getFile(${p}): old=${oldGetFile(p)}, new=${newGetFile(p)}`)
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
