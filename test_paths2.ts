function newGetDirectory(path: string | undefined) {
  if (!path) return ""

  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
      const trimmed = path.replace(/[\/\\]+$/, "")
      if (!trimmed) return "" // Memory asks to return ""
      const newLastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
      return newLastIndex === -1 ? "/" : trimmed.slice(0, newLastIndex).replace(/\\/g, "/") + "/"
  }

  if (lastIndex === -1) return "/"
  return path.slice(0, lastIndex).replace(/\\/g, "/") + "/"
}
console.log(newGetDirectory("/"))
console.log(newGetDirectory("\\"))
