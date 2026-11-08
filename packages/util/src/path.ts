// ⚡ Bolt: Optimized path utilities using strictly native string methods
// to avoid intermediate array allocations and regex overhead.

export function getFilename(path: string | undefined) {
  if (!path) return ""

  let trimmed = path
  while (trimmed.length > 0 && (trimmed.endsWith('/') || trimmed.endsWith('\\'))) {
    trimmed = trimmed.slice(0, -1)
  }
  if (!trimmed) return ""

  const normalized = trimmed.replaceAll('\\', '/')
  const lastSlash = normalized.lastIndexOf('/')

  return lastSlash === -1 ? trimmed : normalized.slice(lastSlash + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""

  let trimmed = path
  while (trimmed.length > 1 && (trimmed.endsWith('/') || trimmed.endsWith('\\'))) {
    trimmed = trimmed.slice(0, -1)
  }

  // Explicitly preserve the edge case returning "/" for root paths
  if (trimmed === '/' || trimmed === '\\') return '/'

  const normalized = trimmed.replaceAll('\\', '/')
  const lastSlash = normalized.lastIndexOf('/')

  if (lastSlash === -1) return '/'

  return normalized.slice(0, lastSlash + 1)
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const parts = path.split(".")
  return parts[parts.length - 1]
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
