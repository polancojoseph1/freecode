// ⚡ Bolt Performance Optimization:
// Replaced regex overhead and intermediate array allocations (`replace`, `split`, `slice`, `join`)
// with fast, native string methods (`endsWith`, `lastIndexOf`, `slice`, `replaceAll`).
// This drastically improves execution speed for path parsing operations across the app.

export function getFilename(path: string | undefined) {
  if (!path) return ""
  let end = path.length
  while (end > 0 && (path.endsWith("/", end) || path.endsWith("\\", end))) end--
  if (end === 0) return ""
  let lastSlash = path.lastIndexOf("/", end - 1)
  let lastBackslash = path.lastIndexOf("\\", end - 1)
  return path.slice((lastSlash > lastBackslash ? lastSlash : lastBackslash) + 1, end)
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  let end = path.length
  while (end > 1 && (path.endsWith("/", end) || path.endsWith("\\", end))) end--
  if (end === 1 && (path === "/" || path === "\\")) return "/"
  let lastSlash = path.lastIndexOf("/", end - 1)
  let lastBackslash = path.lastIndexOf("\\", end - 1)
  let maxSlash = lastSlash > lastBackslash ? lastSlash : lastBackslash
  if (maxSlash === -1) return "/"
  let dir = path.slice(0, maxSlash)
  if (lastBackslash !== -1) dir = dir.replaceAll("\\", "/")
  return dir + "/"
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
