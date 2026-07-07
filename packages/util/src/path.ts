// ⚡ Bolt Optimization: Use zero-allocation string iteration instead of
// regex replacements and array splitting for hot-path path parsing functions.
export function getFilename(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0) {
    const char = path.charCodeAt(end)
    if (char !== 47 && char !== 92) break // non-slash
    end--
  }
  if (end < 0) return ""
  let start = end
  while (start >= 0) {
    const char = path.charCodeAt(start)
    if (char === 47 || char === 92) break // slash
    start--
  }
  return path.slice(start + 1, end + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0) {
    const char = path.charCodeAt(end)
    if (char !== 47 && char !== 92) break // non-slash
    end--
  }
  if (end < 0) return "/"
  let start = end
  while (start >= 0) {
    const char = path.charCodeAt(start)
    if (char === 47 || char === 92) break // slash
    start--
  }
  if (start < 0) return "/"
  const dir = path.slice(0, start + 1)
  return dir.replace(/\\/g, "/")
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
