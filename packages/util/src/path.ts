// ⚡ Bolt: Optimized path utilities using native string methods (lastIndexOf, slice)
// to eliminate regex evaluation overhead and intermediate array allocations (.split).
export function getFilename(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path[end] === "/" || path[end] === "\\")) {
    end--
  }
  if (end < 0) return ""

  const lastSlash = path.lastIndexOf("/", end)
  const lastBackslash = path.lastIndexOf("\\", end)
  const start = Math.max(lastSlash, lastBackslash)

  return path.slice(start + 1, end + 1)
}

// ⚡ Bolt: Optimized string iteration to replace regex allocations.
export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path[end] === "/" || path[end] === "\\")) {
    end--
  }

  if (end < 0) return "/" // Return "/" for root paths

  const lastSlash = path.lastIndexOf("/", end)
  const lastBackslash = path.lastIndexOf("\\", end)
  const start = Math.max(lastSlash, lastBackslash)

  if (start < 0) return "/"

  return path.slice(0, start + 1).replace(/\\/g, "/")
}

// ⚡ Bolt: Optimized with lastIndexOf to prevent Array split allocation.
export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const lastDot = path.lastIndexOf(".")
  if (lastDot < 0) return path
  return path.slice(lastDot + 1)
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
