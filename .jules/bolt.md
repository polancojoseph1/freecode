## 2025-03-24 - [SolidJS primitive state tracking]
**Learning:** Using `createStore` for tracking primitive state in components causes unnecessary proxy overhead in SolidJS.
**Action:** When tracking primitives (like numbers, booleans, or simple strings) in a high-frequency render component (like AnimatedNumber), prefer `createSignal` over `createStore`.

## Performance Learnings

- **Glob Scanning & Concurrent I/O**: Sequential `await` calls inside `for...of` loops over file paths can be a significant performance bottleneck in TypeScript/Node/Bun. Refactoring these loops to map the file paths to an array of Promises and then `await Promise.all()` can yield massive speedups (e.g., ~9.5x improvement for parsing 1000 Markdown files) because it allows the underlying async I/O and parsing operations to run concurrently.
