import { describe, expect, test } from "bun:test"
import { findLast } from "../src/array"

describe("util.findLast", () => {
  test("should find the last element matching the predicate", () => {
    const items = [1, 2, 3, 2, 1]
    const result = findLast(items, (item) => item === 2)
    expect(result).toBe(2)
  })

  test("should find the last element when multiple elements match", () => {
    const items = [
      { id: 1, val: "a" },
      { id: 2, val: "b" },
      { id: 3, val: "a" },
    ]
    const result = findLast(items, (item) => item.val === "a")
    expect(result).toEqual({ id: 3, val: "a" })
  })

  test("should return undefined if no element matches", () => {
    const items = [1, 2, 3]
    const result = findLast(items, (item) => item === 4)
    expect(result).toBeUndefined()
  })

  test("should return undefined for empty array", () => {
    const items: number[] = []
    const result = findLast(items, (item) => item === 1)
    expect(result).toBeUndefined()
  })

  test("should provide item, index, and array to predicate", () => {
    const items = ["a", "b", "c"]
    const calls: [string, number, readonly string[]][] = []

    findLast(items, (item, index, arr) => {
      calls.push([item, index, arr])
      return false
    })

    expect(calls).toEqual([
      ["c", 2, items],
      ["b", 1, items],
      ["a", 0, items],
    ])
  })

  test("should stop iteration once an element is found", () => {
    const items = [1, 2, 3, 4, 5]
    let count = 0
    findLast(items, (item) => {
      count++
      return item === 4
    })
    expect(count).toBe(2) // 5, then 4
  })
})
