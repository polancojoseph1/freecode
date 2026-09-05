export function getFilename(path: string | undefined) {
  if (!path) return ""
  // Optimized: use native string methods and iteration over regex/split to prevent array allocations
  let end = path.length - 1
  while (end >= 0 && (path[end] === '/' || path[end] === '\\')) {
    end--
  }
  if (end < 0) return ""
  const lastSlash = path.lastIndexOf('/', end)
  const lastBackslash = path.lastIndexOf('\\', end)
  const lastSep = Math.max(lastSlash, lastBackslash)
  return path.slice(lastSep + 1, end + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  // Optimized: use native string methods and slicing instead of split/join to avoid allocations
  let end = path.length - 1
  while (end >= 0 && (path[end] === '/' || path[end] === '\\')) {
    end--
  }
  if (end < 0) return "/" // return root for paths that are only slashes
  const lastSlash = path.lastIndexOf('/', end)
  const lastBackslash = path.lastIndexOf('\\', end)
  const lastSep = Math.max(lastSlash, lastBackslash)
  if (lastSep < 0) return "/"
  const dir = path.slice(0, lastSep + 1)
  return dir.includes('\\') ? dir.replace(/\\/g, "/") : dir
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  // Optimized: use lastIndexOf instead of split to prevent array allocations
  const lastDot = path.lastIndexOf(".")
  return lastDot < 0 ? path : path.slice(lastDot + 1)
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
