export function getFilename(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  let code = path.charCodeAt(end)
  // Trim trailing slashes
  while (end >= 0 && (code === 47 || code === 92)) {
    end--
    if (end >= 0) code = path.charCodeAt(end)
  }
  if (end < 0) return ""
  let start = end
  code = path.charCodeAt(start)
  // Find last slash
  while (start >= 0 && code !== 47 && code !== 92) {
    start--
    if (start >= 0) code = path.charCodeAt(start)
  }
  return path.slice(start + 1, end + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  let code = path.charCodeAt(end)
  // Trim trailing slashes
  while (end >= 0 && (code === 47 || code === 92)) {
    end--
    if (end >= 0) code = path.charCodeAt(end)
  }
  if (end < 0) return "/"
  let start = end
  code = path.charCodeAt(start)
  // Find last slash
  while (start >= 0 && code !== 47 && code !== 92) {
    start--
    if (start >= 0) code = path.charCodeAt(start)
  }
  if (start < 0) return "/"

  let dir = path.slice(0, start)
  if (dir.indexOf('\\') !== -1) dir = dir.replace(/\\/g, "/")
  return dir + "/"
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
