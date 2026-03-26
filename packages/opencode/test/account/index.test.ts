import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { Effect, Option } from "effect"

import { Account } from "../../src/account/index"
import { AccountRepo } from "../../src/account/repo"
import { AccessToken, AccountID, RefreshToken } from "../../src/account/schema"
import { runtime } from "../../src/effect/runtime"
import { Database } from "../../src/storage/db"

const truncate = Effect.sync(() => {
  const db = Database.Client()
  db.run(/*sql*/ `DELETE FROM account_state`)
  db.run(/*sql*/ `DELETE FROM account`)
})

describe("Account namespace wrapper", () => {
  beforeAll(async () => {
    await runtime.runPromise(truncate)
  })

  afterAll(async () => {
    await runtime.runPromise(truncate)
  })

  test("Account.token returns the access token for a valid account", async () => {
    const id = AccountID.make("test-user-token")

    await runtime.runPromise(
      AccountRepo.use((r) =>
        r.persistAccount({
          id,
          email: "test@example.com",
          url: "https://control.example.com",
          accessToken: AccessToken.make("at_123_test"),
          refreshToken: RefreshToken.make("rt_456"),
          expiry: Date.now() + 3600_000,
          orgID: Option.none(),
        }),
      ).pipe(Effect.provide(AccountRepo.layer)),
    )

    const token = await Account.token(id)
    expect(token).toBe(AccessToken.make("at_123_test"))
  })

  test("Account.token returns undefined for an unknown account", async () => {
    const id = AccountID.make("unknown-user")
    const token = await Account.token(id)
    expect(token).toBeUndefined()
  })
})
