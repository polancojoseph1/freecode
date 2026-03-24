import { ConfigMarkdown } from "./src/config/markdown";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { Glob } from "./src/util/glob";

async function run() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "freecode-bench-"));
  const commandDir = path.join(dir, "commands");
  await fs.mkdir(commandDir, { recursive: true });

  for (let i = 0; i < 500; i++) {
    await fs.writeFile(
      path.join(commandDir, `cmd${i}.md`),
      `---\ndescription: "Test command ${i}"\n---\nHello ${i}`
    );
  }

  // Baseline implementation
  const files = await Glob.scan("{command,commands}/**/*.md", {
      cwd: dir,
      absolute: true,
      dot: true,
      symlink: true,
  });

  const startSeq = performance.now();
  for (const item of files) {
    const md = await ConfigMarkdown.parse(item).catch(() => undefined);
  }
  const endSeq = performance.now();

  const startPar = performance.now();
  await Promise.all(
    files.map(async (item) => {
      const md = await ConfigMarkdown.parse(item).catch(() => undefined);
    })
  );
  const endPar = performance.now();

  console.log(`Sequential: ${endSeq - startSeq}ms`);
  console.log(`Parallel: ${endPar - startPar}ms`);
}

run().catch(console.error);
