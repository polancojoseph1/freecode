## 2023-10-27 - Implement Feishu Webhook Security
**Vulnerability:** The `/feishu` webhook endpoint lacked cryptographic verification, allowing any unauthorized party to trigger webhook events by spoofing the Feishu API.
**Learning:** Feishu requires validating an `X-Lark-Signature` using SHA-256 (not HMAC) over `timestamp + nonce + encrypt_key + body`. Implementing this correctly prevents unauthorized access and spoofing, failing-closed if any headers are missing.
**Prevention:** Always verify incoming webhook signatures from external APIs to ensure authenticity and integrity before processing requests. Use the correct hashing algorithm specified by the provider (e.g., standard SHA-256 for Feishu).
