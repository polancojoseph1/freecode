import { describe, expect, test, mock, setSystemTime } from "bun:test"
import { createScrollPersistence } from "./layout-scroll"

describe("createScrollPersistence", () => {
  test("debounces persisted scroll writes", async () => {
    // Bun doesn't have vi.useFakeTimers(), so we use real timers but wait for them
    const snapshot = {
      session: {
        review: { x: 0, y: 0 },
      },
    } as Record<string, Record<string, { x: number; y: number }>>
    const writes: Array<Record<string, { x: number; y: number }>> = []
    const scroll = createScrollPersistence({
      debounceMs: 10,
      getSnapshot: (sessionKey) => snapshot[sessionKey],
      onFlush: (sessionKey, next) => {
        snapshot[sessionKey] = next
        writes.push(next)
      },
    })

    for (const i of Array.from({ length: 30 }, (_, n) => n + 1)) {
      scroll.setScroll("session", "review", { x: 0, y: i })
    }

    // Wait for just under debounce time
    await Bun.sleep(5)
    expect(writes).toHaveLength(0)

    // Wait for the rest of debounce time
    await Bun.sleep(15)

    expect(writes).toHaveLength(1)
    expect(writes[0]?.review).toEqual({ x: 0, y: 30 })

    scroll.setScroll("session", "review", { x: 0, y: 30 })
    await Bun.sleep(20)

    expect(writes).toHaveLength(1)
    scroll.dispose()
  })

  test("reseeds empty cache after persisted snapshot loads", () => {
    const snapshot = {
      session: {},
    } as Record<string, Record<string, { x: number; y: number }>>

    const scroll = createScrollPersistence({
      getSnapshot: (sessionKey) => snapshot[sessionKey],
      onFlush: () => {},
    })

    expect(scroll.scroll("session", "review")).toBeUndefined()

    snapshot.session = {
      review: { x: 12, y: 34 },
    }

    expect(scroll.scroll("session", "review")).toEqual({ x: 12, y: 34 })
    scroll.dispose()
  })
})
