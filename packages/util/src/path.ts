export function getFilename(path: string | undefined) {
  if (!path) return ""

  // ⚡ Optimization: Avoid regex replace and split to prevent intermediate array and string allocations
  let end = path.length
  while (end > 0) {
    const ch = path[end - 1]
    if (ch === "/" || ch === "\\") {
      end--
    } else {
      break
    }
  }

  if (end === 0) return ""

  // ⚡ Optimization: Use native lastIndexOf which is highly optimized compared to regex/split
  const lastSlash = path.lastIndexOf("/", end - 1)
  const lastBackslash = path.lastIndexOf("\\", end - 1)
  const lastIndex = Math.max(lastSlash, lastBackslash)

  return lastIndex === -1 ? path.slice(0, end) : path.slice(lastIndex + 1, end)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""

  // ⚡ Optimization: Trim without regex creation overhead
  let end = path.length
  while (end > 0) {
    const ch = path[end - 1]
    if (ch === "/" || ch === "\\") {
      end--
    } else {
      break
    }
  }

  if (end === 0) return "/"

  // ⚡ Optimization: Use native search instead of split to find directory boundary
  const lastSlash = path.lastIndexOf("/", end - 1)
  const lastBackslash = path.lastIndexOf("\\", end - 1)
  const lastIndex = Math.max(lastSlash, lastBackslash)

  if (lastIndex === -1) return "/"

  return path.slice(0, lastIndex).replace(/\\/g, "/") + "/"
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""

  // ⚡ Optimization: Use lastIndexOf instead of string split to avoid array allocation for every dot
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
