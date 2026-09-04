// Optimization: We use native string methods (replace, lastIndexOf, slice)
// instead of regex-based path manipulation and array transformations (split/join).
// This avoids unnecessary intermediate array and regex allocations, speeding up hot paths.

export function getFilename(path: string | undefined) {
  if (!path) return ""
  const normalized = path.replace(/\\/g, "/")

  let end = normalized.length - 1
  while (end >= 0 && normalized.charCodeAt(end) === 47 /* '/' */) {
    end--
  }

  if (end < 0) return ""

  const lastSlash = normalized.lastIndexOf("/", end)
  return normalized.slice(lastSlash + 1, end + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  const normalized = path.replace(/\\/g, "/")

  let end = normalized.length - 1
  while (end >= 0 && normalized.charCodeAt(end) === 47 /* '/' */) {
    end--
  }

  if (end < 0) return "/" // specifically handles root paths to match previous logic

  const lastSlash = normalized.lastIndexOf("/", end)
  if (lastSlash === -1) return "/"

  return normalized.slice(0, lastSlash + 1)
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const lastDot = path.lastIndexOf(".")
  if (lastDot === -1) return path
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
