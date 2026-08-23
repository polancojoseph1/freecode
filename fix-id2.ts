import { randomBytes } from "crypto"

const LENGTH = 26;

function randomBase62(length: number): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    let result = ""
    const bytes = randomBytes(length)
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % 62]
    }
    return result
}

function create(prefix: string, descending: boolean, timestamp: number): string {
    let now = BigInt(timestamp) * BigInt(0x1000) + BigInt(1)
    now = descending ? ~now : now

    const timeBytes = Buffer.alloc(7)
    for (let i = 0; i < 7; i++) {
      timeBytes[i] = Number((now >> BigInt(48 - 8 * i)) & BigInt(0xff))
    }

    return prefix + "_" + timeBytes.toString("hex") + randomBase62(LENGTH - 14)
}

function extract(id: string): number {
    const prefix = id.split("_")[0]
    const hex = id.slice(prefix.length + 1, prefix.length + 15)
    const encoded = BigInt("0x" + hex)
    return Number(encoded / BigInt(0x1000))
}

const ts = Date.now();
const id = create("tool", false, ts);
const ex = extract(id);
console.log("TS:", ts);
console.log("ID:", id);
console.log("EX:", ex);
console.log("Match?", ts === ex);
