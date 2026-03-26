import { expect, test, afterEach } from "bun:test"
import { Effect, Layer, Option } from "effect"

import { Account } from "../../src/account/index"
import { AccountRepo } from "../../src/account/repo"
import { AccessToken, AccountID, OrgID, RefreshToken } from "../../src/account/schema"
import { Database } from "../../src/storage/db"

function truncate() {
  const db = Database.Client()
  db.run(/*sql*/ `DELETE FROM account_state`)
  db.run(/*sql*/ `DELETE FROM account`)
}

afterEach(() => {
  truncate()
})

test("Account.active() returns undefined when no accounts exist", () => {
  truncate()
  const active = Account.active()
  expect(active).toBeUndefined()
})

test("Account.active() returns the active account", async () => {
  truncate()

  const persistLayer = Layer.mergeAll(AccountRepo.layer)
  const effect = AccountRepo.use((r) =>
    r.persistAccount({
      id: AccountID.make("user-1"),
      email: "test@example.com",
      url: "https://control.example.com",
      accessToken: AccessToken.make("at_123"),
      refreshToken: RefreshToken.make("rt_456"),
      expiry: Date.now() + 3600_000,
      orgID: Option.some(OrgID.make("org-1")),
    })
  )

  await Effect.runPromise(effect.pipe(Effect.provide(persistLayer)))

  const active = Account.active()
  expect(active).toBeDefined()
  expect(active?.id).toBe(AccountID.make("user-1"))
  expect(active?.email).toBe("test@example.com")
  expect(active?.active_org_id).toBe(OrgID.make("org-1"))
})
