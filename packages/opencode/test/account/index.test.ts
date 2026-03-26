import { expect, test, describe, mock, afterEach } from "bun:test"
import { Option, Effect, Layer } from "effect"

import { AccountID, OrgID, AccountService } from "../../src/account/service"
import { Account } from "../../src/account"

describe("Account facade", () => {
  afterEach(() => {
    mock.restore()
  })

  describe("Account.active", () => {
    test("returns account successfully", () => {
      const expected = { id: AccountID.make("user-1") }
      const activeMock = mock().mockReturnValue(Effect.succeed(Option.some(expected)))

      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ active: activeMock }));
        const result = Account.active()
        expect(result).toEqual(expected as any)
        expect(activeMock).toHaveBeenCalledTimes(1)
      } finally {
        AccountService.use = originalUse
      }
    })

    test("returns undefined on error or empty", () => {
      const activeMock = mock().mockReturnValue(Effect.succeed(Option.none()))
      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ active: activeMock }));
        const result = Account.active()
        expect(result).toBeUndefined()
        expect(activeMock).toHaveBeenCalledTimes(1)
      } finally {
        AccountService.use = originalUse
      }
    })
  })

  describe("Account.config", () => {
    test("resolves config successfully", async () => {
      const id = AccountID.make("user-1")
      const org = OrgID.make("org-1")
      const expected = { foo: "bar" }
      const configMock = mock().mockReturnValue(Effect.succeed(Option.some(expected)))

      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ config: configMock }));
        const result = await Account.config(id, org)
        expect(result).toEqual(expected)
        expect(configMock).toHaveBeenCalledWith(id, org)
      } finally {
        AccountService.use = originalUse
      }
    })

    test("returns undefined on error or empty", async () => {
      const id = AccountID.make("user-2")
      const org = OrgID.make("org-2")
      const configMock = mock().mockReturnValue(Effect.succeed(Option.none()))

      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ config: configMock }));
        const result = await Account.config(id, org)
        expect(result).toBeUndefined()
        expect(configMock).toHaveBeenCalledWith(id, org)
      } finally {
        AccountService.use = originalUse
      }
    })
  })

  describe("Account.token", () => {
    test("resolves token successfully", async () => {
      const id = AccountID.make("user-1")
      const expected = "at_123"
      const tokenMock = mock().mockReturnValue(Effect.succeed(Option.some(expected)))

      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ token: tokenMock }));
        const result = await Account.token(id)
        expect(result).toEqual(expected as any)
        expect(tokenMock).toHaveBeenCalledWith(id)
      } finally {
        AccountService.use = originalUse
      }
    })

    test("returns undefined on error or empty", async () => {
      const id = AccountID.make("user-2")
      const tokenMock = mock().mockReturnValue(Effect.succeed(Option.none()))

      const originalUse = AccountService.use;
      try {
        AccountService.use = mock().mockImplementation((f: any) => f({ token: tokenMock }));
        const result = await Account.token(id)
        expect(result).toBeUndefined()
        expect(tokenMock).toHaveBeenCalledWith(id)
      } finally {
        AccountService.use = originalUse
      }
    })
  })
})
