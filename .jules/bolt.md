## 2025-03-24 - [SolidJS primitive state tracking]
**Learning:** Using `createStore` for tracking primitive state in components causes unnecessary proxy overhead in SolidJS.
**Action:** When tracking primitives (like numbers, booleans, or simple strings) in a high-frequency render component (like AnimatedNumber), prefer `createSignal` over `createStore`.
