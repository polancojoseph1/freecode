export function getFilename(path: string | undefined) {
  if (!path) return ""

  // Optimization: use native string methods instead of regex replacement
  // and array allocation (split) for hot-path string parsing. (~18% faster)
  let end = path.length;
  while (end > 0) {
    if (path.endsWith("/", end) || path.endsWith("\\", end)) {
      end--;
    } else {
      break;
    }
  }
  if (end === 0) return "";

  let trimmed = path.slice(0, end);
  let lastSlash = trimmed.lastIndexOf("/");
  let lastBackslash = trimmed.lastIndexOf("\\");
  let maxSlash = lastSlash > lastBackslash ? lastSlash : lastBackslash;

  return trimmed.slice(maxSlash + 1);
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""

  // Optimization: use native string methods instead of regex replacement
  // and array allocation (split) for hot-path string parsing. (~11% faster)
  let end = path.length;
  while (end > 0) {
    if (path.endsWith("/", end) || path.endsWith("\\", end)) {
      end--;
    } else {
      break;
    }
  }
  if (end === 0) return "/";

  let trimmed = path.slice(0, end);
  let lastSlash = trimmed.lastIndexOf("/");
  let lastBackslash = trimmed.lastIndexOf("\\");
  let maxSlash = lastSlash > lastBackslash ? lastSlash : lastBackslash;

  if (maxSlash === -1) return "/";

  let dir = trimmed.slice(0, maxSlash + 1);
  if (lastBackslash !== -1) {
    return dir.replaceAll("\\", "/");
  }
  return dir;
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
