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
## $(date +%Y-%m-%d) - SSR XSS in Share Components
**Vulnerability:** The web components (`ContentMarkdown`, `ContentCode`, `ContentBash`) assigned dynamically parsed markdown and syntax-highlighted code output directly to `innerHTML` without server-side sanitization. This introduced a Server-Side Rendering (SSR) Cross-Site Scripting (XSS) vulnerability.
**Learning:** Even though `shiki` and `marked` are meant for rendering text, if an attacker crafts malicious payloads that bypass their native escaping (or if the payload contains raw HTML tags in Markdown that aren't stripped), assigning the raw HTML string directly to `innerHTML` allows the execution of arbitrary JavaScript. Since this rendering happens on the server/isomorphically, typical client-side only sanitizers (like a purely browser `dompurify` block) might be skipped during SSR, delivering the malicious payload in the initial HTML document.
**Prevention:** Always pipe the output of markdown parsers and syntax highlighters through `isomorphic-dompurify` configured to allow necessary styling tags and attributes before passing the result to `innerHTML`.
## $(date +%Y-%m-%d) - Zombie File Handles in Test Environments
**Vulnerability:** A missing `Instance.disposeAll()` call in testing teardown (like in `packages/opencode/test/tool/edit.test.ts`) causes the background worker threads or file watcher instances associated with `Instance` to remain open.
**Learning:** These lingering event loop handles (such as those managed by `bun`'s or Node.js's I/O polling, or underlying OS watcher constructs) prevent the runtime process from exiting gracefully after tests finish. In CI environments like GitHub Actions, this causes the test job to appear hung until it is forcibly terminated by a runner timeout signal (`Exit code 143`).
**Prevention:** In any environment or test file initializing `Instance.provide(...)`, strictly ensure that a corresponding `afterAll(async () => { await Instance.disposeAll() })` block is defined to explicitly shut down all active instances and unref background resources.
