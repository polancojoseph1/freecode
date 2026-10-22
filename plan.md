1. **Fix timing attack vulnerabilities in `packages/function/src/api.ts`**
   - Import `timingSafeEqual` from `node:crypto` and `Buffer` from `node:buffer` in `packages/function/src/api.ts` (as the memory says, Cloudflare Workers require this for `timingSafeEqual`). Actually, the memory says `new TextEncoder().encode(string)` is preferred to generate a `Uint8Array` rather than `Buffer`. I will use `new TextEncoder().encode()` instead of `Buffer`.
   - Update `assertSecret` to use `timingSafeEqual` when comparing the provided secret with the stored secret. Check lengths first to prevent errors.
   - Update the `/share_delete_admin` endpoint to use `timingSafeEqual` when comparing `adminSecret` with `Resource.ADMIN_SECRET.value`.

2. **Fix timing attack vulnerabilities in `packages/enterprise/src/core/share.ts`**
   - Import `timingSafeEqual` from `node:crypto` or use `crypto.subtle.timingSafeEqual` if available, or just standard web API. The environment is Cloudflare Worker. The memory says: "In Cloudflare Worker environments... prioritize using the native Web Crypto API... However, `node:crypto` (e.g., `timingSafeEqual`) and `node:buffer` are fully supported via compatibility flags...". I will use `timingSafeEqual` from `node:crypto`.
   - Apply the same pattern to the `remove`, `snapshot`, and `append` functions where `share.secret !== input.share.secret` is checked.
   - Update `packages/enterprise/src/core/share.ts` to use `timingSafeEqual` with `new TextEncoder().encode()`.

3. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
   - Run verification commands and `pre_commit_instructions` as required by the prompt rules.

4. **Submit the fix**
   - Create a pull request using the `submit` tool, adhering to the Sentinel persona format guidelines for PRs.
