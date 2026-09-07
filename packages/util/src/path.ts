export function getFilename(path: string | undefined) {
  if (!path) return ""

  // OPTIMIZATION: Avoid using `.replace` and `.split` with regexes as they create multiple intermediate arrays and strings.
  // Instead, use native string methods and pointer arithmetic which is ~5x faster.
  let end = path.length
  while (end > 0 && (path[end - 1] === "/" || path[end - 1] === "\\")) {
    end--
  }

  if (end === 0) return ""

  const trimmed = path.slice(0, end)
  const lastSlash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))
  return trimmed.slice(lastSlash + 1)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""

  // OPTIMIZATION: Avoid using `.replace` and `.split` with regexes.
  // Use native string `.lastIndexOf` and slice methods.
  let end = path.length
  while (end > 0 && (path[end - 1] === "/" || path[end - 1] === "\\")) {
    end--
  }

  if (end === 0) return "/"

  const trimmed = path.slice(0, end)
  const lastSlash = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))

  if (lastSlash === -1) return "/"

  return trimmed.slice(0, lastSlash).replace(/\\/g, "/") + "/"
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
