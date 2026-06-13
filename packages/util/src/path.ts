export function getFilename(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path.charCodeAt(end) === 47 || path.charCodeAt(end) === 92)) {
    end--
  }
  if (end < 0) return ""

  let start = end
  while (start >= 0) {
    const code = path.charCodeAt(start)
    if (code === 47 || code === 92) {
      break
    }
    start--
  }
  return path.slice(start + 1, end + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let end = path.length - 1
  while (end >= 0 && (path.charCodeAt(end) === 47 || path.charCodeAt(end) === 92)) {
    end--
  }
  if (end < 0) return ""

  let start = end
  while (start >= 0) {
    const code = path.charCodeAt(start)
    if (code === 47 || code === 92) {
      break
    }
    start--
  }
  if (start < 0) return "/"

  let res = ""
  for (let i = 0; i <= start; i++) {
    const code = path.charCodeAt(i)
    if (code === 92) {
      res += "/"
    } else {
      res += path[i]
    }
  }
  return res
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
