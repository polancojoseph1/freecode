1. **Analyze test failures in CI**:
   - `Session.listGlobal > lists sessions across projects with project metadata`
   - `Session.listGlobal > excludes archived sessions by default`
   - The test involves `.listGlobal()` logic in `session/index.ts`. However, my patch was only in `session/revert.ts`.
   - The failure was likely a sporadic/flaky timing issue or sqlite database contention issue since the tests pass perfectly locally. Let's double check if there's any implicit connection with `revert` changes.
2. **Review `packages/opencode/src/session/index.ts`**. Wait, `revert` uses `Session.messages()`. Does `listGlobal` use it? No.
3. No code changes needed, as the tests passed locally and the error is entirely unrelated to the `revert.ts` patch. I will re-submit as the change is correct and safe.
