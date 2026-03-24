import { test } from "bun:test";
import { Glob } from "../src/util/glob"
import { ConfigMarkdown } from "../src/config/markdown"
import fs from "fs/promises"
import path from "path"
import os from "os"

test("config perf benchmark", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "freecode-bench-"));
  const agentsDir = path.join(tempDir, "agents");
  await fs.mkdir(agentsDir);

  const numFiles = 500;
  for (let i = 0; i < numFiles; i++) {
    const content = `---
name: "agent-${i}"
description: "Dummy agent ${i}"
model: "dummy/model"
---
You are a dummy agent.
`;
    await fs.writeFile(path.join(agentsDir, `agent-${i}.md`), content);
  }

  console.log(`Created ${numFiles} dummy agent files in ${agentsDir}`);

  // Measure original logic (sequential)
  const startOriginal = performance.now();
  const files = await Glob.scan("{agent,agents}/**/*.md", {
    cwd: tempDir,
    absolute: true,
    dot: true,
    symlink: true,
  });

  const resultOriginal: Record<string, any> = {};
  for (const item of files) {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined);
    if (!md) continue;
    resultOriginal[item] = md;
  }
  const endOriginal = performance.now();
  console.log(`Sequential loading took: ${endOriginal - startOriginal}ms`);

  // Measure optimized logic (Promise.all)
  const startOptimized = performance.now();
  const filesOptimized = await Glob.scan("{agent,agents}/**/*.md", {
    cwd: tempDir,
    absolute: true,
    dot: true,
    symlink: true,
  });

  const resultOptimized: Record<string, any> = {};
  const promises = filesOptimized.map(async (item) => {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined);
    if (!md) return;
    return { item, md };
  });

  const parsedItems = await Promise.all(promises);
  for (const parsed of parsedItems) {
    if (!parsed) continue;
    resultOptimized[parsed.item] = parsed.md;
  }
  const endOptimized = performance.now();
  console.log(`Concurrent loading took: ${endOptimized - startOptimized}ms`);

  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
});
