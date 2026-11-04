export function getFilename(path: string | undefined) {
  if (!path) return ""
  // Optimized: use native string methods instead of regex `.replace` and `.split`
  // to avoid intermediate array allocations and regex overhead.
  let end = path.length;
  while (end > 0 && (path.endsWith('/', end) || path.endsWith('\\', end))) {
    end--;
  }
  if (end === 0) return "";
  const lastForward = path.lastIndexOf('/', end - 1);
  const lastBackward = path.lastIndexOf('\\', end - 1);
  const lastSlash = lastForward > lastBackward ? lastForward : lastBackward;
  return path.slice(lastSlash + 1, end);
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  // Optimized: use native string methods instead of regex `.replace` and `.split`
  // to avoid intermediate array allocations and regex overhead.
  let end = path.length;
  while (end > 0 && (path.endsWith('/', end) || path.endsWith('\\', end))) {
    end--;
  }
  // Preserve edge case: returning "/" for root paths
  if (end === 0) return "/";
  const lastForward = path.lastIndexOf('/', end - 1);
  const lastBackward = path.lastIndexOf('\\', end - 1);
  const lastSlash = lastForward > lastBackward ? lastForward : lastBackward;
  // Preserve edge case: returning "/" for root paths without multiple parts
  if (lastSlash === -1) return "/";
  return path.slice(0, lastSlash).replaceAll('\\', '/') + "/";
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
