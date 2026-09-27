import { afterAll } from "bun:test"
import { Instance } from "../../src/project/instance"

afterAll(async () => {
  await Instance.disposeAll()
})
