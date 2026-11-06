// ⚡ Bolt Optimization: Use native string operations instead of regex/split to avoid array allocations
export function getFilename(path: string | undefined) {
  if (!path) return ""
  let p = path.replaceAll("\\", "/")
  while (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1)
  }
  if (p === "/") return ""
  const lastSlash = p.lastIndexOf("/")
  return lastSlash === -1 ? p : p.slice(lastSlash + 1)
}

// ⚡ Bolt Optimization: Use native string operations instead of regex/split to avoid array allocations
export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let p = path.replaceAll("\\", "/")
  while (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1)
  }
  if (p === "/") return "/"
  const lastSlash = p.lastIndexOf("/")
  return lastSlash === -1 ? "/" : p.slice(0, lastSlash) + "/"
}

// ⚡ Bolt Optimization: Use native string operations instead of regex/split to avoid array allocations
export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const lastDot = path.lastIndexOf(".")
  return lastDot === -1 ? path : path.slice(lastDot + 1)
}

export function getFilenameTruncated(path: string | undefined, maxLength: number = 20) {
  const filename = getFilename(path)
  if (filename.length <= maxLength) return filename
  const lastDot = filename.lastIndexOf(".")
  const ext = lastDot <= 0 ? "" : filename.slice(lastDot)
  const available = maxLength - ext.length - 1 // -1 for ellipsis
  if (available <= 0) return filename.slice(0, maxLength - 1) + "…"
  return filename.slice(0, available) + "…" + ext
}

export function truncateMiddle(text: string, maxLength: number = 20) {
  if (text.length <= maxLength) return text
  const available = maxLength - 1 // -1 for ellipsis
  const start = Math.ceil(available / 2)
  const end = Math.floor(available / 2)
  return text.slice(0, start) + "…" + text.slice(-end)
}
