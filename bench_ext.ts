import { getFileExtension as oldGetExt } from "./packages/util/src/path.ts"

function newGetExt(path: string | undefined) {
  if (!path) return ""
  const lastDot = path.lastIndexOf(".")
  return lastDot === -1 ? path : path.slice(lastDot + 1)
}

const paths = [
  "",
  "file",
  "file.txt",
  "folder/file.txt",
  "folder/file.tar.gz",
  ".hidden",
]

for (const p of paths) {
  if (oldGetExt(p) !== newGetExt(p)) {
    console.error(`Mismatch for getExt('${p}'): old='${oldGetExt(p)}', new='${newGetExt(p)}'`)
  }
}

const ITERATIONS = 1000000;
let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (const p of paths) {
    oldGetExt(p);
  }
}
let oldTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  for (const p of paths) {
    newGetExt(p);
  }
}
let newTime = performance.now() - start;

console.log(`Old: ${oldTime.toFixed(2)}ms`);
console.log(`New: ${newTime.toFixed(2)}ms`);
console.log(`Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(2)}%`);
