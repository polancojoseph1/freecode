import { describe, it, expect } from "bun:test"
import { Server } from "../../src/server/server"

describe("Server CORS", () => {
  it("should securely restrict localhost origins", async () => {
    // Start server minimally just to fetch the CORS middleware logic.
    // However, instead of running server, we can mock the request and see if it is allowed.
    const app = Server.createApp({})

    // We send OPTIONS request because in hono middleware chaining,
    // actual auth middleware returns 401 early, while OPTIONS bypasses it
    // and returns CORS preflight headers properly.

    // Valid origins
    let res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://localhost:3000" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "https://localhost:8080" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://localhost:8080")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1:5173" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://127.0.0.1:5173")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://localhost" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://127.0.0.1")

    // Invalid/malicious origins
    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://localhost:3000.evil.com" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1.evil.com:8080" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "https://evil.com/http://localhost:3000" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://127.0.0.1.com" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()
  })

  it("should allow specified tauri domains", async () => {
    const app = Server.createApp({})

    let res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "tauri://localhost" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("tauri://localhost")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "http://tauri.localhost" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://tauri.localhost")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "https://tauri.localhost" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://tauri.localhost")
  })

  it("should allow explicitly provided cors domains", async () => {
    const app = Server.createApp({ cors: ["https://example.com"] })

    let res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "https://example.com" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com")

    res = await app.request("/path", { method: "OPTIONS", headers: { Origin: "https://other.com" } })
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull()
  })
})
