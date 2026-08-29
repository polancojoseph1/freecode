export function getFilename(path: string | undefined) {
  if (!path) return ""
  // Optimized: Use native string methods to avoid array allocations from split()
  const trimmed = path.replace(/[\/\\]+$/, "")
  if (!trimmed) return ""
  const slash = trimmed.lastIndexOf('/')
  const bslash = trimmed.lastIndexOf('\\')
  const last = slash > bslash ? slash : bslash
  return last === -1 ? trimmed : trimmed.slice(last + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  // Optimized: Use native string methods to avoid array allocations from split()
  const trimmed = path.replace(/[\/\\]+$/, "")
  if (!trimmed) return "/"
  const slash = trimmed.lastIndexOf('/')
  const bslash = trimmed.lastIndexOf('\\')
  const last = slash > bslash ? slash : bslash

  if (last === -1) return "/"
  const dir = trimmed.slice(0, last)
  return (dir.indexOf('\\') !== -1 ? dir.replace(/\\/g, '/') : dir) + '/'
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  // Optimized: Use native string methods to avoid array allocations from split()
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
