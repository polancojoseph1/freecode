import { Config } from "./src/config/config"
import { Instance } from "./src/project/instance"
import { Global } from "./src/global"
import path from "path"
import fs from "fs/promises"

async function run() {
  const testDir = path.join(process.cwd(), ".bench_config")
  await fs.mkdir(testDir, { recursive: true })

  // Create 100 fake config directories
  for (let i = 0; i < 100; i++) {
    const dir = path.join(testDir, `dir_${i}.freecode`)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, "freecode.jsonc"), JSON.stringify({ description: `jsonc_${i}` }))
    await fs.writeFile(path.join(dir, "freecode.json"), JSON.stringify({ description: `json_${i}` }))
  }

  // Set Instance directory
  Instance.provide({
    directory: testDir,
    fn: async () => {
      // Warmup
      for (let i = 0; i < 3; i++) {
        await Instance.reload({ directory: testDir })
        await Config.state()
      }

      // Benchmark
      const start = performance.now()
      const ITERATIONS = 10
      for (let i = 0; i < ITERATIONS; i++) {
        await Instance.reload({ directory: testDir })
        await Config.state()
      }
      const end = performance.now()

      console.log(`Average time: ${(end - start) / ITERATIONS}ms`)
    }
  })
}

run().catch(console.error)
