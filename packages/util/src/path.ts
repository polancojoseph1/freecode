export function getFilename(path: string | undefined) {
  if (!path) return ""

  // ⚡ Bolt: Fast path string operations - no regex, no intermediate array allocations
  let end = path.length;
  // Remove trailing slashes
  while (end > 0 && (path.endsWith("/", end) || path.endsWith("\\", end))) {
    end--;
  }

  if (end === 0) return "";

  // Find last slash
  const lastSlash = path.lastIndexOf("/", end - 1);
  const lastBackslash = path.lastIndexOf("\\", end - 1);
  const start = Math.max(lastSlash, lastBackslash);

  return path.slice(start + 1, end);
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  if (path === "/") return "/"; // ⚡ Bolt: Preserve root path edge case

  // ⚡ Bolt: Fast path string operations - no regex, no intermediate array allocations
  let end = path.length;
  // Remove trailing slashes
  while (end > 0 && (path.endsWith("/", end) || path.endsWith("\\", end))) {
    end--;
  }

  if (end === 0) return "/";

  // Find last slash
  const lastSlash = path.lastIndexOf("/", end - 1);
  const lastBackslash = path.lastIndexOf("\\", end - 1);
  const start = Math.max(lastSlash, lastBackslash);

  if (start < 0) return "/";

  const dir = path.slice(0, start);
  return (dir.includes("\\") ? dir.replaceAll("\\", "/") : dir) + "/";
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
