## 2024-05-18 - Prevent arbitrary code execution in open-path IPC handler
**Vulnerability:** Arbitrary code execution vulnerability in `open-path` IPC handler where user-provided application string was directly executed via `execFile`.
**Learning:** In Electron IPC handlers, never pass unsanitized executable names or paths from the renderer directly to `execFile` or `spawn`.
**Prevention:** Always validate and resolve the application first (e.g., using `deps.checkAppExists` and `deps.resolveAppPath`) to prevent arbitrary code execution vulnerabilities.