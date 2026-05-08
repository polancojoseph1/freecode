import { afterEach, describe, expect, test } from "bun:test"
import { uuid } from "./uuid"

const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")
const secureDescriptor = Object.getOwnPropertyDescriptor(globalThis, "isSecureContext")
const setCrypto = (value: Partial<Crypto> | undefined) => {
  if (value === undefined) {
    delete (globalThis as any).crypto
  } else {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: value as Crypto,
    })
  }
}

const setSecure = (value: boolean) => {
  Object.defineProperty(globalThis, "isSecureContext", {
    configurable: true,
    value,
  })
}

afterEach(() => {
  if (cryptoDescriptor) {
    Object.defineProperty(globalThis, "crypto", cryptoDescriptor)
  } else {
    delete (globalThis as any).crypto
  }

  if (secureDescriptor) {
    Object.defineProperty(globalThis, "isSecureContext", secureDescriptor)
  }

  if (!secureDescriptor) {
    delete (globalThis as { isSecureContext?: boolean }).isSecureContext
  }
})

const mockGetRandomValues = (arr: Uint8Array) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = 0x55 // Arbitrary predictable value
  }
  return arr
}

describe("uuid", () => {
  test("uses randomUUID in secure contexts", () => {
    setCrypto({ randomUUID: () => "00000000-0000-0000-0000-000000000000" })
    setSecure(true)
    expect(uuid()).toBe("00000000-0000-0000-0000-000000000000")
  })

  test("falls back in insecure contexts", () => {
    setCrypto({ randomUUID: () => "00000000-0000-0000-0000-000000000000", getRandomValues: mockGetRandomValues } as any)
    setSecure(false)
    expect(uuid()).toBe("55555555-5555-4555-9555-555555555555")
  })

  test("falls back when randomUUID throws", () => {
    setCrypto({
      randomUUID: () => {
        throw new DOMException("Failed", "OperationError")
      },
      getRandomValues: mockGetRandomValues
    } as any)
    setSecure(true)
    expect(uuid()).toBe("55555555-5555-4555-9555-555555555555")
  })

  test("falls back when randomUUID is unavailable", () => {
    setCrypto({ getRandomValues: mockGetRandomValues } as any)
    setSecure(true)
    expect(uuid()).toBe("55555555-5555-4555-9555-555555555555")
  })

  test("throws when crypto is unavailable", () => {
    setCrypto(undefined)
    setSecure(true)
    expect(() => uuid()).toThrow("No cryptographically secure random source available")
  })
})
