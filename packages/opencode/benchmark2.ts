import { Glob } from "./src/util/glob.ts"
import { ConfigMarkdown } from "./src/config/markdown.ts"
import * as fs from "fs/promises"
import * as path from "path"
import { tmpdir } from "./test/fixture/fixture.ts"
import { z } from "zod"

const Agent = z.object({
  name: z.string(),
  prompt: z.string(),
  description: z.string().optional(),
})
type Agent = z.infer<typeof Agent>

async function run() {
  const tmp = await tmpdir()
  await fs.mkdir(path.join(tmp.path, "modes"))

  // create 1000 modes
  for (let i = 0; i < 1000; i++) {
    await fs.writeFile(path.join(tmp.path, "modes", `mode${i}.md`), `---\ndescription: Test mode ${i}\n---\nPrompt ${i}`)
  }

  const dir = tmp.path;

  // Measure Sequential loadMode
  const start = performance.now()
  const result: Record<string, Agent> = {}
  for (const item of await Glob.scan("{mode,modes}/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })) {
    const md = await ConfigMarkdown.parse(item).catch(async (err) => undefined)
    if (!md) continue

    const config = {
      name: path.basename(item, ".md"),
      ...md.data,
      prompt: md.content.trim(),
    }
    const parsed = Agent.safeParse(config)
    if (parsed.success) {
      result[config.name] = {
        ...parsed.data,
        mode: "primary" as const,
      } as any
      continue
    }
  }
  const end = performance.now()

  console.log(`Loaded ${Object.keys(result).length} modes in ${(end - start).toFixed(2)}ms (Sequential baseline)`)

  // Measure Concurrent loadMode
  const start2 = performance.now()
  const items = await Glob.scan("{mode,modes}/*.md", {
    cwd: dir,
    absolute: true,
    dot: true,
    symlink: true,
  })

  const parsedItems = await Promise.all(
    items.map(async (item) => {
      const md = await ConfigMarkdown.parse(item).catch(async (err) => undefined)
      if (!md) return undefined

      const config = {
        name: path.basename(item, ".md"),
        ...md.data,
        prompt: md.content.trim(),
      }
      const parsed = Agent.safeParse(config)
      if (parsed.success) {
        return {
          name: config.name,
          agent: {
            ...parsed.data,
            mode: "primary" as const,
          } as any,
        }
      }
      return undefined
    }),
  )

  const result2: Record<string, Agent> = {}
  for (const parsed of parsedItems) {
    if (parsed) {
      result2[parsed.name] = parsed.agent
    }
  }

  const end2 = performance.now()
  console.log(`Loaded ${Object.keys(result2).length} modes in ${(end2 - start2).toFixed(2)}ms (Concurrent optimized)`)

  // Output difference
  const improvement = ((end - start) / (end2 - start2)).toFixed(2)
  console.log(`Speedup: ${improvement}x`)

  // Cleanup
  await tmp[Symbol.asyncDispose]()
}

run()
