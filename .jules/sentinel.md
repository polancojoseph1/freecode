## 2025-03-24 - Proxy Request Header Stripping
**Vulnerability:** The proxy implementation in `packages/opencode/src/server/server.ts` stripped all client headers (including `Authorization`, `Cookie`, and `Content-Type`) by spreading `c.req.raw.headers` (`{ ...c.req.raw.headers }`) into a plain JavaScript object.
**Learning:** `Headers` objects in the Fetch API do not store their data as enumerable properties. Spreading them results in an empty object `{}`. When proxying requests, this leads to silent authentication bypasses and dropped context for the upstream server.
**Prevention:** Always instantiate a new `Headers` object from the existing headers (e.g., `new Headers(c.req.raw.headers)`) or use `Object.fromEntries(c.req.raw.headers.entries())` when manipulating or forwarding fetch requests.

## 2025-03-25 - Command Injection via `child_process.exec`
**Vulnerability:** The `GithubInstallCommand` in `packages/opencode/src/cli/cmd/github.ts` used `child_process.exec` with unescaped string interpolation to open a URL in the browser, posing a command injection risk.
**Learning:** Using `exec` with dynamically constructed commands (even if the current input is a hardcoded URL) is a dangerous pattern that can easily lead to command injection if the input source ever changes or becomes user-controlled. The codebase already had a safer alternative (`open` package) in use elsewhere.
**Prevention:** Avoid `child_process.exec` with unescaped string interpolation. Prefer using specialized, secure libraries (like `open` for URLs) or `child_process.spawn` with an array of arguments to prevent shell expansion and command injection.
