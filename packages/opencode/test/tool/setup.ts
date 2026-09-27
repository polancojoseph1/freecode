import { afterAll } from "bun:test"
import { Instance } from "../../src/instance/instance"

afterAll(async () => {
  await Instance.disposeAll()
})
