import { describe, expect, test, beforeEach, afterEach, setSystemTime } from "bun:test"
import { getRelativeTime } from "./time"

describe("getRelativeTime", () => {
  const mockNow = new Date("2024-01-01T12:00:00.000Z")

  beforeEach(() => {
    setSystemTime(mockNow)
  })

  afterEach(() => {
    setSystemTime() // reset to actual system time
  })

  const t = (key: string, params?: Record<string, string | number>) => {
    if (params) {
      return `${key} ${JSON.stringify(params)}`
    }
    return key
  }

  test("returns justNow for differences under 60 seconds", () => {
    // 30 seconds ago
    const date = new Date(mockNow.getTime() - 30 * 1000)
    expect(getRelativeTime(date.toISOString(), t as any)).toBe("common.time.justNow")
  })

  test("returns minutesAgo.short for differences under 60 minutes", () => {
    // 5 minutes ago
    const date = new Date(mockNow.getTime() - 5 * 60 * 1000)
    expect(getRelativeTime(date.toISOString(), t as any)).toBe('common.time.minutesAgo.short {"count":5}')
  })

  test("returns hoursAgo.short for differences under 24 hours", () => {
    // 3 hours ago
    const date = new Date(mockNow.getTime() - 3 * 60 * 60 * 1000)
    expect(getRelativeTime(date.toISOString(), t as any)).toBe('common.time.hoursAgo.short {"count":3}')
  })

  test("returns daysAgo.short for differences of 24 hours or more", () => {
    // 2 days ago
    const date = new Date(mockNow.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(getRelativeTime(date.toISOString(), t as any)).toBe('common.time.daysAgo.short {"count":2}')
  })

  test("handles exact boundaries correctly", () => {
    // Exactly 60 seconds ago should be 1 minute
    const sixtySec = new Date(mockNow.getTime() - 60 * 1000)
    expect(getRelativeTime(sixtySec.toISOString(), t as any)).toBe('common.time.minutesAgo.short {"count":1}')

    // Exactly 60 minutes ago should be 1 hour
    const sixtyMin = new Date(mockNow.getTime() - 60 * 60 * 1000)
    expect(getRelativeTime(sixtyMin.toISOString(), t as any)).toBe('common.time.hoursAgo.short {"count":1}')

    // Exactly 24 hours ago should be 1 day
    const twentyFourHrs = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000)
    expect(getRelativeTime(twentyFourHrs.toISOString(), t as any)).toBe('common.time.daysAgo.short {"count":1}')
  })
})
