## 2025-03-24 - Proxy Request Header Stripping
**Vulnerability:** The proxy implementation in `packages/opencode/src/server/server.ts` stripped all client headers (including `Authorization`, `Cookie`, and `Content-Type`) by spreading `c.req.raw.headers` (`{ ...c.req.raw.headers }`) into a plain JavaScript object.
**Learning:** `Headers` objects in the Fetch API do not store their data as enumerable properties. Spreading them results in an empty object `{}`. When proxying requests, this leads to silent authentication bypasses and dropped context for the upstream server.
**Prevention:** Always instantiate a new `Headers` object from the existing headers (e.g., `new Headers(c.req.raw.headers)`) or use `Object.fromEntries(c.req.raw.headers.entries())` when manipulating or forwarding fetch requests.

## 2025-05-15 - Command Injection in Browser Opening
**Vulnerability:** Command injection in `packages/opencode/src/cli/cmd/github.ts` due to use of `child_process.exec` with template literals for URLs.
**Impact:** Allows execution of arbitrary shell commands if the URL contains shell metacharacters like `&`, `;`, or `|`.
**Fix:** Replaced `exec` with `spawn`, passing arguments as an array to avoid shell interpretation.
**Verification:** Verified via platform-specific simulation script.
## 2024-03-27 - Command injection in wslPath
**Vulnerability:** Shell command injection via unsanitized user input in `wsl -e sh -lc "wslpath..."`.
**Learning:** Even if quotes are escaped, interpolating untrusted paths into a shell command string (`sh -c <string>`) leaves the command vulnerable to shell metacharacters like backticks or `$()`.
**Prevention:** Pass variables as discrete arguments to `sh` and refer to them inside the shell string with `$1`, `$2`, etc.
## 2026-03-28 - Command Injection Prevention in Node.js Shell Spawns
**Vulnerability:** Found a command injection vulnerability where a string array `args` was directly concatenated into a shell command for execution (e.g., ``"sh -c \"sidecar\" " + args``) in `packages/desktop-electron/src/main/cli.ts`.
**Learning:** Using `spawn` or `execFile` with an options array directly is preferred over passing an entire string to `sh -c`. If executing via a shell wrapper like `sh -c` is necessary, it is critical to correctly escape all user-influenced string arguments before interpolating them into the final shell command to prevent injection.
**Prevention:** Use a proven library like `shell-quote` to escape array elements before concatenating them into shell script strings, or prefer passing discrete arguments directly to the spawn function instead of interpolating into a shell wrapper.
## $(date +%Y-%m-%d) - Prevent Unsafe URL Schemes in shell.openExternal
**Vulnerability:** The Electron `ipcMain` handler for `open-link` directly passed unsanitized user-provided URLs to `shell.openExternal()`. This allows an attacker to open arbitrary local files or execute commands using schemes like `file://` or `smb://`.
**Learning:** In Electron, `shell.openExternal` is dangerous when used with untrusted input because it hands off the URL to the OS's default handler, which can execute local programs or scripts if a malicious protocol is provided.
**Prevention:** Always validate and allowlist URL protocols (e.g., `http:`, `https:`, `mailto:`) using the `URL` constructor before passing them to `shell.openExternal()`.
## 2025-05-24 - Pre-resolution of Command Paths in IPC Contexts
**Vulnerability:** Found a command injection vulnerability where untrusted arguments derived from pre-resolved application paths were evaluated via `execFile` or `spawn` inside Electron IPC handlers.
**Learning:** Pre-resolving paths in the frontend (renderer) and passing them back to backend processes opens the door to arbitrary command execution since the path isn't fully sanitized and its integrity isn't verified in the backend.
**Prevention:** Handlers should never trust pre-resolved execution paths or names. Send raw application names from the frontend and apply a robust blocklist combined with existence checks and backend-only resolution inside the main process before invoking subprocess execution APIs.
## 2024-06-09 - Missing Webhook Signature Validation on Hono Worker Endpoint
**Vulnerability:** The `/feishu` POST endpoint accepted webhook payloads, parsing them as JSON and routing messages to Discord without any signature validation. This meant anyone could forge a webhook payload to potentially trigger unauthorized internal alerts or messages.
**Learning:** Feishu, like many webhook providers, signs requests using standard HMAC-like verification (concatenating timestamp + nonce + secret + raw body and verifying with SHA-256). Since the endpoint processes raw JSON bodies directly with `await c.req.json()`, it dropped the raw string content required for strict signature generation.
**Prevention:** Always authenticate external webhooks by verifying signatures provided via headers. Ensure that the original `rawBody` string is extracted using `await c.req.text()` prior to `JSON.parse` to avoid spacing/formatting discrepancies when hashing, and strictly ensure that buffer lengths and timing-safe equality validations are used on signatures.
