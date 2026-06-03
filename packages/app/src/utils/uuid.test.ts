import { afterEach, describe, expect, test } from "bun:test"
import { uuid } from "./uuid"

const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")
const secureDescriptor = Object.getOwnPropertyDescriptor(globalThis, "isSecureContext")
const randomDescriptor = Object.getOwnPropertyDescriptor(Math, "random")

const setCrypto = (value: Partial<Crypto>) => {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    value: value as Crypto,
  })
}

const setSecure = (value: boolean) => {
  Object.defineProperty(globalThis, "isSecureContext", {
    configurable: true,
    value,
  })
}

const setRandom = (value: () => number) => {
  Object.defineProperty(Math, "random", {
    configurable: true,
    value,
  })
}

afterEach(() => {
  if (cryptoDescriptor) {
    Object.defineProperty(globalThis, "crypto", cryptoDescriptor)
  }

  if (secureDescriptor) {
    Object.defineProperty(globalThis, "isSecureContext", secureDescriptor)
  }

  if (!secureDescriptor) {
    delete (globalThis as { isSecureContext?: boolean }).isSecureContext
  }

  if (randomDescriptor) {
    Object.defineProperty(Math, "random", randomDescriptor)
  }
})

describe("uuid", () => {
  test("uses randomUUID in secure contexts", () => {
    setCrypto({ randomUUID: () => "00000000-0000-0000-0000-000000000000" })
    setSecure(true)
    expect(uuid()).toBe("00000000-0000-0000-0000-000000000000")
  })

  test("throws in insecure contexts", () => {
    setCrypto({ randomUUID: () => "00000000-0000-0000-0000-000000000000" })
    setSecure(false)
    expect(() => uuid()).toThrow("Secure random number generation is not available.")
  })

  test("throws when randomUUID throws", () => {
    setCrypto({
      randomUUID: () => {
        throw new DOMException("Failed", "OperationError")
      },
    })
    setSecure(true)
    expect(() => uuid()).toThrow("Secure random number generation is not available.")
  })

  test("throws when randomUUID is unavailable", () => {
    setCrypto({})
    setSecure(true)
    expect(() => uuid()).toThrow("Secure random number generation is not available.")
  })
})
