import z from "zod"
import { randomBytes } from "crypto"

export namespace Identifier {
  const prefixes = {
    session: "ses",
    message: "msg",
    permission: "per",
    question: "que",
    user: "usr",
    part: "prt",
    pty: "pty",
    tool: "tool",
    workspace: "wrk",
  } as const

  export function schema(prefix: keyof typeof prefixes) {
    return z.string().startsWith(prefixes[prefix])
  }

  const LENGTH = 26

  // State for monotonic ID generation
  let lastTimestamp = 0
  let counter = 0

  export function ascending(prefix: keyof typeof prefixes, given?: string) {
    return generateID(prefix, false, given)
  }

  export function descending(prefix: keyof typeof prefixes, given?: string) {
    return generateID(prefix, true, given)
  }

  function generateID(prefix: keyof typeof prefixes, descending: boolean, given?: string): string {
    if (!given) {
      return create(prefix, descending)
    }

    if (!given.startsWith(prefixes[prefix])) {
      throw new Error(`ID ${given} does not start with ${prefixes[prefix]}`)
    }
    return given
  }

  function randomBase62(length: number): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    let result = ""
    const bytes = randomBytes(length)
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % 62]
    }
    return result
  }

  export function create(prefix: keyof typeof prefixes, descending: boolean, timestamp?: number): string {
    const currentTimestamp = timestamp ?? Date.now()

    if (currentTimestamp !== lastTimestamp) {
      lastTimestamp = currentTimestamp
      counter = 0
    }
    counter++

    // ⚡ Bolt: Using native Number arithmetic over BigInt for ID generation avoids expensive allocations.
    // The maximum generated value fits comfortably within Number.MAX_SAFE_INTEGER.
    let now = currentTimestamp * 0x1000 + counter

    const timeBytes = Buffer.alloc(6)
    if (descending) {
      for (let i = 0; i < 6; i++) {
        timeBytes[i] = (~Math.floor(now / Math.pow(2, 40 - 8 * i))) & 0xff
      }
    } else {
      for (let i = 0; i < 6; i++) {
        timeBytes[i] = Math.floor(now / Math.pow(2, 40 - 8 * i)) & 0xff
      }
    }

    return prefixes[prefix] + "_" + timeBytes.toString("hex") + randomBase62(LENGTH - 12)
  }

  /** Extract timestamp from an ascending ID. Does not work with descending IDs. */
  export function timestamp(id: string): number {
    const prefix = id.split("_")[0]
    const hex = id.slice(prefix.length + 1, prefix.length + 13)
    // ⚡ Bolt: Using parseInt over BigInt parsing is significantly faster in V8/Bun.
    const encoded = parseInt(hex, 16)
    return Math.floor(encoded / 0x1000)
  }
}
