import { describe, expect, test, mock } from "bun:test"
import { Config } from "../../src/config/config"
import { tmpdir } from "../fixture/fixture"
import { Instance } from "../../src/project/instance"
import { Filesystem } from "../../src/util/filesystem"
import path from "path"
import fs from "fs/promises"
import { ConfigPaths } from "../../src/config/paths"

describe("Performance - Project Config Loading", () => {
  test("loads multiple config files efficiently", async () => {
    let currentDir = ""
    await using tmp = await tmpdir({
      init: async (dir) => {
        // Create a deep directory structure with multiple freecode.json files
        // to simulate a monorepo or project with multiple config overrides.
        const numFiles = 100

        // Write the main config
        await Filesystem.write(
          path.join(dir, "freecode.json"),
          JSON.stringify({
            $schema: "https://opencode.ai/config.json",
            username: "root-user",
            plugin: ["root-plugin"],
          })
        )

        currentDir = dir
        for (let i = 0; i < numFiles; i++) {
          currentDir = path.join(currentDir, `sub_${i}`)
          await fs.mkdir(currentDir, { recursive: true })
          await Filesystem.write(
            path.join(currentDir, "freecode.json"),
            JSON.stringify({
              $schema: "https://opencode.ai/config.json",
              username: `user_${i}`,
              plugin: [`plugin_${i}`],
            })
          )
        }
      },
    })

    await Instance.provide({
      directory: currentDir, // Set Instance directory deeper to load all parents
      fn: async () => {
        const start = performance.now()

        const config = await Config.get()

        const end = performance.now()
        const duration = end - start

        console.log(`Config loading took ${duration.toFixed(2)}ms`)

        // Ensure configs were merged correctly
        expect(config.username).toBeDefined()
        expect(config.plugin?.length).toBeGreaterThan(0)
      },
    })
  })
})
