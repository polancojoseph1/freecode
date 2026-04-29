## 2026-04-29 - [False Positives in Automated Reviews]
**Vulnerability:** N/A
**Learning:** Automated code reviewers may incorrectly hallucinate the absence of methods on dynamically injected dependencies (e.g., flagging `deps.checkAppExists` as missing in `packages/desktop-electron/src/main/ipc.ts`), even when they clearly exist in the type definition and implementation.
**Prevention:** Always trust local typechecking results (`bun turbo typecheck`) over automated code review output.
