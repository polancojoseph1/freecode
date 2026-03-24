import { Glob } from "./packages/opencode/src/util/glob.ts"
import { ConfigMarkdown } from "./packages/opencode/src/config/markdown.ts"
import { Agent, Command } from "./packages/opencode/src/config/schema.ts"
import * as fs from "fs/promises"
import * as path from "path"
import { tmpdir } from "./packages/opencode/test/fixture/fixture.ts"
import { Config } from "./packages/opencode/src/config/config.ts"

async function run() {
  const tmp = tmpdir()
  await fs.mkdir(path.join(tmp.path, "modes"))

  // create 100 modes
  for (let i = 0; i < 100; i++) {
    await fs.writeFile(path.join(tmp.path, "modes", `mode${i}.md`), `---
description: Test mode ${i}
---

Prompt ${i}`)
  }

  // Measure loadMode
  const start = performance.now()
  const result = await Config.loadMode(tmp.path)
  const end = performance.now()

  console.log(`Loaded ${Object.keys(result).length} modes in ${(end - start).toFixed(2)}ms`)
}

run()
