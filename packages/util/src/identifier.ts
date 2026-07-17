import { randomBytes } from "crypto"

export namespace Identifier {
  const LENGTH = 26

  // State for monotonic ID generation
  let lastTimestamp = 0
  let counter = 0

  export function ascending() {
    return create(false)
  }

  export function descending() {
    return create(true)
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

  export function create(descending: boolean, timestamp?: number): string {
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

    return timeBytes.toString("hex") + randomBase62(LENGTH - 12)
  }
}
