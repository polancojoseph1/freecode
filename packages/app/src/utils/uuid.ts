const fallback = () => {
  const c = globalThis.crypto
  if (!c || typeof c.getRandomValues !== "function") {
    throw new Error("Secure random source unavailable")
  }
  const bytes = new Uint8Array(16)
  c.getRandomValues(bytes)
  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  let result = ""
  for (let i = 0; i < 16; i++) {
    const hex = bytes[i].toString(16).padStart(2, "0")
    result += hex
    if (i === 3 || i === 5 || i === 7 || i === 9) {
      result += "-"
    }
  }
  return result
}

export function uuid() {
  const c = globalThis.crypto
  if (!c || typeof c.randomUUID !== "function") return fallback()
  if (typeof globalThis.isSecureContext === "boolean" && !globalThis.isSecureContext) return fallback()
  try {
    return c.randomUUID()
  } catch {
    return fallback()
  }
}
