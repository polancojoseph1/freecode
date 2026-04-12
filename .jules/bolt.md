## 2025-03-24 - [SolidJS primitive state tracking]
**Learning:** Using `createStore` for tracking primitive state in components causes unnecessary proxy overhead in SolidJS.
**Action:** When tracking primitives (like numbers, booleans, or simple strings) in a high-frequency render component (like AnimatedNumber), prefer `createSignal` over `createStore`.

### Performance Optimization: Concurrent Markdown Reading in Config Loader
**Date**: 2025-02-23
**Module**: `packages/opencode/src/config/config.ts`

**Optimization Details**:
Refactored the config loading functions (`loadAgent`, `loadCommand`, `loadMode`) to resolve an N+1 synchronous read issue. Previously, these functions would iterate through matched Markdown files and `await ConfigMarkdown.parse(...)` sequentially. This was refactored to use `Promise.all` allowing all matched files to be parsed concurrently.

**Measured Impact**:
A benchmark loading 500 dummy agent files showed significant improvements:
- **Sequential Baseline**: ~166.4ms
- **Concurrent Optimization**: ~18.1ms
- **Net Improvement**: ~89% faster load times for large directories of agents/commands/modes.

This change is safe and straightforward, resolving unnecessary CPU/IO blockage when initializing the application configuration.

## Performance Optimization: Storage Migration Concurrency
- **Change:** Refactored sequential `for...of` loop in `packages/opencode/src/storage/storage.ts` to use concurrent chunked processing.
- **Impact:** Decreased migration time for 1000 items from ~500ms to ~100ms (5x improvement).
- **Learning:** Utilize the existing `work` utility from `packages/opencode/src/util/queue.ts` for concurrency limits instead of writing custom chunking logic. Also, group independent I/O writes within the same iteration using `Promise.all` for additional gains.

## 2025-03-24 - [SolidJS Store Proxy Overhead]
**Learning:** Using `createStore` to track state that updates frequently (like in a `setTimeout` loop or `requestAnimationFrame`) or contains simple primitives adds measurable proxy overhead in SolidJS components.
**Action:** Always prefer `createSignal` over `createStore` for independent, frequently updating primitive values like numbers, strings, or booleans within UI components (e.g., `Typewriter`, `TextStrikethrough`).

## 2025-03-24 - [Array.reduce Hot Path Overhead]
**Learning:** Using `Array.prototype.reduce` for frequently called length calculations (like `promptLength` evaluated on every keystroke) introduces unnecessary function allocation overhead compared to basic `for` loops.
**Action:** For hot-path array iteration requiring high performance, prefer traditional `for` loops over `reduce` to eliminate per-element closure allocations.

## 2025-03-24 - [Concurrent Async Work inside Loops]
**Learning:** Sequential `await` calls within `for...of` loops, especially for filesystem or parsing operations, introduce significant "N+1" synchronous bottlenecks. In `skill.ts`, loading multiple `.md` files in a `for` loop caused delays that scale linearly with the number of files.
**Action:** Use `await Promise.all(array.map(...))` to execute I/O or independent asynchronous operations concurrently instead of awaiting each iteration one by one.
## 2025-03-08 - Parallelize Independent I/O Tasks While Maintaining Sequential Merging
**Learning:** In deeply nested configurations like those in `config.ts`, while the merge order of config objects strictly dictates final state, the disk read and parsing I/O can still be parallelized. By returning objects mapping the path/order to the parsed config from a `Promise.all` and merging them subsequently in order, N+1 synchronous read blocking was eliminated without breaking precedence rules.
**Action:** When working with sequential dependency resolution patterns where order matters, map the I/O into a `Promise.all` and defer the state mutation (like deep merging) into a second sequential loop over the awaited results.

## 2026-04-12 - [Database Array Mutation Race Condition]
**Learning:** When replacing sequential `await` loops with `Promise.all(array.map(...))` to optimize database writes, mutating a shared array (e.g., `results.push()` inside the map callback) introduces a race condition because the promises resolve in non-deterministic order. This scrambles the original array order.
**Action:** When order matters, either return values from the `Promise.all` map and process them afterwards, or defer the synchronous array mutations to a separate loop after the `Promise.all` completes.
