## 2025-03-24 - [SolidJS primitive state tracking]
**Learning:** Using `createStore` for tracking primitive state in components causes unnecessary proxy overhead in SolidJS.
**Action:** When tracking primitives (like numbers, booleans, or simple strings) in a high-frequency render component (like AnimatedNumber), prefer `createSignal` over `createStore`.

## Config Load Optimization
Replaced the N+1 sequential directory scanning inside `Config.state()` with a parallel approach.
- **What**: Replaced sequential `for...of` loop with `Promise.all` + `Array.map` for I/O bounds (`loadFile`, `loadCommand`, `loadAgent`, `loadMode`, `loadPlugin`).
- **Why**: Reduced startup initialization blocking. Configuration loading across multiple fallback folders previously forced the JS event loop to await individual file system responses one by one.
- **Impact**: Measured time for `Config.state()` loop reduced from `~51.20ms` to `~11.85ms` per execution in micro-benchmarks (~4.3x improvement).
