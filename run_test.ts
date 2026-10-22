import { getDirectory, getFilename } from "./packages/util/src/path.ts"

console.log("getDirectory('/') =>", JSON.stringify(getDirectory('/')))
console.log("getFilename('/') =>", JSON.stringify(getFilename('/')))
console.log("getDirectory('foo/bar') =>", JSON.stringify(getDirectory('foo/bar')))
console.log("getFilename('foo/bar') =>", JSON.stringify(getFilename('foo/bar')))
console.log("getDirectory('foo/') =>", JSON.stringify(getDirectory('foo/')))
