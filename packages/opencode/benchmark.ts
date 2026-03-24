import path from "path"
import { Filesystem } from "./src/util/filesystem"
import { Storage } from "./src/storage/storage"
import { Glob } from "./src/util/glob"
import os from "os"
import fs from "fs/promises"

async function setupTestData(dir: string, numProjects: number, sessionsPerProject: number) {
  console.log(`Setting up test data: ${numProjects} projects, ${sessionsPerProject} sessions each...`)
  await Filesystem.write(path.join(dir, "migration"), "1") // Ensure we start from migration 1

  for (let p = 0; p < numProjects; p++) {
    const projectID = `proj_${p}`
    for (let s = 0; s < sessionsPerProject; s++) {
      const sessionID = `sess_${p}_${s}`
      const sessionFile = path.join(dir, "session", projectID, `${sessionID}.json`)

      const diffs = Array.from({ length: 5 }, (_, i) => ({
        path: `file${i}.txt`,
        additions: Math.floor(Math.random() * 50),
        deletions: Math.floor(Math.random() * 50),
      }))

      const session = {
        id: sessionID,
        projectID,
        summary: {
          diffs
        }
      }

      await Filesystem.writeJson(sessionFile, session)
    }
  }
}

async function run() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "opencode-bench-"))
  console.log(`Temp dir: ${dir}`)

  try {
    await setupTestData(dir, 10, 50) // 500 files total

    console.log("Starting migration baseline benchmark...")
    const start = performance.now()

    // The migration is index 1 in MIGRATIONS array. We'll run it directly if possible,
    // but MIGRATIONS is private. We can run the `Storage.state()` or mock it.
    // However, Storage.state() uses `Global.Path.data`. Let's mock Global.Path.data instead.

    // Hacky way to inject the path:
    const { Global } = await import("./src/global")
    Object.defineProperty(Global, 'Path', {
      value: { data: path.join(dir, "..") },
      writable: true
    })

    // Overwrite the migration state to 1
    const storageDir = path.join(Global.Path.data, "storage")
    await Filesystem.write(path.join(storageDir, "migration"), "1")

    // Copy our test data to storageDir
    await setupTestData(storageDir, 10, 100) // 1000 files

    const benchStart = performance.now()
    // Trigger migration by calling any storage function, e.g. list()
    await Storage.list([])
    const benchEnd = performance.now()

    console.log(`Migration took: ${(benchEnd - benchStart).toFixed(2)} ms`)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

run().catch(console.error)
