import { expect, test, describe, mock } from "bun:test"
import { Option } from "effect"

import { AccountID, OrgID } from "../../src/account/schema"

// Mock the runtime before importing Account
mock.module("../../src/effect/runtime", () => {
  return {
    runtime: {
      runSync: mock(),
      runPromise: mock()
    }
  }
})

// Now import Account and runtime (which is mocked)
import { Account } from "../../src/account"
import { runtime } from "../../src/effect/runtime"

describe("Account.active", () => {
  test("returns account successfully", () => {
    const expected = { id: AccountID.make("user-1") }
    ;(runtime.runSync as any).mockReturnValue(Option.some(expected))

    const result = Account.active()
    expect(result).toEqual(expected as any)
  })

  test("returns undefined on error or empty", () => {
    ;(runtime.runSync as any).mockReturnValue(Option.none())

    const result = Account.active()
    expect(result).toBeUndefined()
  })
})

describe("Account.config", () => {
  test("resolves config successfully", async () => {
    const id = AccountID.make("user-1")
    const org = OrgID.make("org-1")
    const expected = { foo: "bar" }
    ;(runtime.runPromise as any).mockResolvedValue(Option.some(expected))

    const result = await Account.config(id, org)
    expect(result).toEqual(expected)
  })

  test("returns undefined on error or empty", async () => {
    const id = AccountID.make("user-2")
    const org = OrgID.make("org-2")
    ;(runtime.runPromise as any).mockResolvedValue(Option.none())

    const result = await Account.config(id, org)
    expect(result).toBeUndefined()
  })
})

describe("Account.token", () => {
  test("resolves token successfully", async () => {
    const id = AccountID.make("user-1")
    const expected = "at_123"
    ;(runtime.runPromise as any).mockResolvedValue(Option.some(expected))

    const result = await Account.token(id)
    expect(result).toEqual(expected as any)
  })

  test("returns undefined on error or empty", async () => {
    const id = AccountID.make("user-2")
    ;(runtime.runPromise as any).mockResolvedValue(Option.none())

    const result = await Account.token(id)
    expect(result).toBeUndefined()
  })
})
