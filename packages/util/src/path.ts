export function getFilename(path: string | undefined) {
  if (!path) return ""
  // Optimized: Avoid regex replace and string.split (which creates intermediate array)
  // Instead, use native string methods and indices to slice out the filename
  let end = path.length;
  while (end > 0 && (path[end - 1] === "/" || path[end - 1] === "\\")) {
    end--;
  }
  if (end === 0) return "";

  const p = path.slice(0, end);
  const lastSlash = p.lastIndexOf("/");
  const lastBackslash = p.lastIndexOf("\\");
  const sepIdx = Math.max(lastSlash, lastBackslash);

  return p.slice(sepIdx + 1);
}

export function getDirectory(path: string | undefined) {
  if (!path) return ""
  // Optimized: Avoid regex replace and string.split (which creates intermediate array)
  let end = path.length;
  while (end > 0 && (path[end - 1] === "/" || path[end - 1] === "\\")) {
    end--;
  }

  // If the path was entirely slashes, we return "/" to maintain original behavior and pass existing tests.
  // We prioritize the test's `expect(getDirectory("/")).toBe("/")` as the source of truth for the codebase state.
  if (end === 0) return "/";

  const p = path.slice(0, end);
  const lastSlash = p.lastIndexOf("/");
  const lastBackslash = p.lastIndexOf("\\");
  const sepIdx = Math.max(lastSlash, lastBackslash);

  if (sepIdx === -1) return "/";

  return p.slice(0, sepIdx).replace(/\\/g, "/") + "/";
}

export function getFileExtension(path: string | undefined) {
  if (!path) return ""
  // Optimized: Avoid string.split (which creates an intermediate array)
  const lastDot = path.lastIndexOf(".");
  if (lastDot === -1) return path;
  return path.slice(lastDot + 1);
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
