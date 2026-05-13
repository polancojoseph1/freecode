const fallback = () => {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    cryptoObj.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // Set version to 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // Set variant to 10

    const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("")
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
  }
  throw new Error("No cryptographically secure random source available")
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
