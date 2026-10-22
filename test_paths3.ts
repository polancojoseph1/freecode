export function getDirectory(path: string | undefined) {
  if (!path) return ""

  // ⚡ Optimization: Use native string methods instead of regex and array splitting
  const lastSlash = path.lastIndexOf("/")
  const lastBackslash = path.lastIndexOf("\\")
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === path.length - 1) {
      const trimmed = path.replace(/[\/\\]+$/, "")
      if (!trimmed) return "/"
      const newLastIndex = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
      return newLastIndex === -1 ? "/" : trimmed.slice(0, newLastIndex).replace(/\\/g, "/") + "/"
  }

  if (lastIndex === -1) return "/"
  return path.slice(0, lastIndex).replace(/\\/g, "/") + "/"
}

export function getFilename(path: string | undefined) {
  if (!path) return ""

  // ⚡ Optimization: Use native string methods instead of regex and array splitting
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
