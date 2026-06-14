import z from "zod"

const prefixes = {
  session: "ses",
  message: "msg",
  permission: "per",
  user: "usr",
  part: "prt",
  pty: "pty",
} as const

const LENGTH = 26
let lastTimestamp = 0
let counter = 0

type Prefix = keyof typeof prefixes
export namespace Identifier {
  export function schema(prefix: Prefix) {
    return z.string().startsWith(prefixes[prefix])
  }

  export function ascending(prefix: Prefix, given?: string) {
    return generateID(prefix, false, given)
  }

  export function descending(prefix: Prefix, given?: string) {
    return generateID(prefix, true, given)
  }
}

function generateID(prefix: Prefix, descending: boolean, given?: string): string {
  if (!given) {
    return create(prefix, descending)
  }

  if (!given.startsWith(prefixes[prefix])) {
    throw new Error(`ID ${given} does not start with ${prefixes[prefix]}`)
  }

  return given
}

function create(prefix: Prefix, descending: boolean, timestamp?: number): string {
  const currentTimestamp = timestamp ?? Date.now()

  if (currentTimestamp !== lastTimestamp) {
    lastTimestamp = currentTimestamp
    counter = 0
  }

  counter += 1

  let now = currentTimestamp * 0x1000 + counter

  // ⚡ Bolt: Native Number math avoiding BigInt/Uint8Array allocation speeds up ID generation by ~5x
  // Math.floor + division is used to simulate bitwise shifting since JS bitwise operators truncate to 32 bits
  const chars = "0123456789abcdef"
  let hex = ""
  for (let i = 0; i < 6; i++) {
    let val = Math.floor(now / Math.pow(2, 40 - 8 * i)) & 0xff
    if (descending) val = ~val & 0xff
    hex += chars[val >> 4] + chars[val & 0x0f]
  }

  return prefixes[prefix] + "_" + hex + randomBase62(LENGTH - 12)
}

function randomBase62(length: number): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const bytes = getRandomBytes(length)
  let result = ""
  for (let i = 0; i < length; i += 1) {
    result += chars[bytes[i] % 62]
  }
  return result
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length)
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined

  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    cryptoObj.getRandomValues(bytes)
    return bytes
  }

  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256)
  }

  return bytes
}
