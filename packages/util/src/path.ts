// ⚡ Bolt: Use charCodeAt and loop over split for better performance
export function getFilename(path: string | undefined) {
  if (!path) return ""

  let end = path.length - 1
  while (end >= 0 && (path.charCodeAt(end) === 47 || path.charCodeAt(end) === 92)) {
    end--
  }
  if (end < 0) return ""

  let start = end
  while (start >= 0 && path.charCodeAt(start) !== 47 && path.charCodeAt(start) !== 92) {
    start--
  }

  return path.slice(start + 1, end + 1)
}

// ⚡ Bolt: Use charCodeAt and loop over split to extract directory faster
export function getDirectory(path: string | undefined) {
  if (!path) return ""

  let end = path.length - 1
  while (end >= 0 && (path.charCodeAt(end) === 47 || path.charCodeAt(end) === 92)) {
    end--
  }
  if (end < 0) return ""

  let start = end
  while (start >= 0 && path.charCodeAt(start) !== 47 && path.charCodeAt(start) !== 92) {
    start--
  }

  if (start < 0) return ""

  return path.slice(0, start) + "/"
}

// ⚡ Bolt: Use lastIndexOf and slice instead of split
export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  const lastDot = path.lastIndexOf(".")
  if (lastDot === -1 || lastDot === 0 || lastDot === path.length - 1) return ""

  const lastSlash = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"))
  if (lastSlash > lastDot) return ""

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
