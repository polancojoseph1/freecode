## 2025-02-26 - [Avoid unbounded Promise.all concurrency on filesystem]
**Learning:** When trying to fix N+1 sequential reads by replacing `for...of` loops with parallel execution, using `Promise.all` with arrays populated by `Glob.scan` causes unbounded concurrency. This can cause the process to crash with `EMFILE` errors (too many open files) or memory spikes if the user has a large data set (like many sessions/messages).
**Action:** Use the `work` utility from `src/util/queue.ts` instead to enforce a concurrency limit (e.g., `await work(50, files, async (file) => { ... })`).
