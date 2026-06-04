1. **Analyze Vulnerability**: The `/feishu` endpoint in `packages/function/src/api.ts` does not validate incoming requests using Feishu's webhook signature (`x-lark-signature`). This means anyone could send a request to this endpoint and it would be accepted, leading to unauthorized actions.

2. **Implement Signature Validation**:
   - In `packages/function/src/api.ts`:
     - Read the raw request body using `await c.req.text()`.
     - Parse the JSON body.
     - Extract headers: `x-lark-request-timestamp`, `x-lark-request-nonce`, `x-lark-signature`.
     - If the headers are missing, reject the request (fail-closed) with a 401 Unauthorized status.
     - Import `createHash` from `node:crypto`.
     - Compute the standard SHA-256 hash using the exact header concatenation order: `timestamp` + `nonce` + `Resource.FEISHU_WEBHOOK_SECRET.value` + `rawBody`.
     - Validate the computed hash against the `x-lark-signature` header (both hex strings). If they don't match, return a 401.

3. **Add Secret to SST `infra/app.ts`**:
   - Add `FEISHU_WEBHOOK_SECRET = new sst.Secret("FEISHU_WEBHOOK_SECRET")`.
   - Include it in the `link` array of the API worker.
   - Also add it to `sst-env.d.ts` manually to ensure type compilation succeeds.

4. **Verify**:
   - Run typecheck in `packages/function` (`npx typescript@latest/tsc --noEmit --project packages/function/tsconfig.json`).
   - Run tests if applicable.

5. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
