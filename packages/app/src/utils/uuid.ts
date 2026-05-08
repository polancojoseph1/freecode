const fallback = () => {
  const c = globalThis.crypto
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    let id = ""
    for (let i = 0; i < 16; i++) {
      id += bytes[i].toString(16).padStart(2, "0")
      if (i === 3 || i === 5 || i === 7 || i === 9) id += "-"
    }
    return id
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
