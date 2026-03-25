import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { createAim } from "./aim"

describe("createAim", () => {
  let mockEl: HTMLElement
  let onActivate: ReturnType<typeof mock>
  let activeId: string | undefined
  let isEnabled: boolean
  let mockSetTimeout: ReturnType<typeof mock>
  let mockClearTimeout: ReturnType<typeof mock>
  let originalSetTimeout: typeof window.setTimeout
  let originalClearTimeout: typeof window.clearTimeout

  const createMouseEvent = (x: number, y: number): MouseEvent => {
    return {
      clientX: x,
      clientY: y,
    } as unknown as MouseEvent
  }

  beforeEach(() => {
    originalSetTimeout = window.setTimeout
    originalClearTimeout = window.clearTimeout

    activeId = undefined
    isEnabled = true
    onActivate = mock((id: string) => {
      activeId = id
    })

    // Mock an element from x:0, y:0 to x:200, y:500
    mockEl = {
      getBoundingClientRect: () => ({
        top: 0,
        right: 200,
        bottom: 500,
        left: 0,
        width: 200,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
    } as HTMLElement

    // Mock timers using standard mock to test how it delegates
    mockSetTimeout = mock((fn: Function, ms: number) => {
      // Just immediately invoke the timeout function for simplicity in these tests
      // unless we specifically need to test timer cancellation. For cancellation,
      // we can return a mock timer id and assert on it.
      return 123
    })
    mockClearTimeout = mock((id: number) => {})

    Object.defineProperty(window, "setTimeout", { value: mockSetTimeout, writable: true })
    Object.defineProperty(window, "clearTimeout", { value: mockClearTimeout, writable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, "setTimeout", { value: originalSetTimeout, writable: true })
    Object.defineProperty(window, "clearTimeout", { value: originalClearTimeout, writable: true })
    mock.restore()
  })

  test("activates immediately if no element is currently active", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    aim.enter("item1", createMouseEvent(10, 10))
    expect(onActivate).toHaveBeenCalledWith("item1")
    expect(activeId).toBe("item1")
  })

  test("ignores movements when disabled", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    isEnabled = false
    aim.enter("item1", createMouseEvent(10, 10))
    expect(onActivate).not.toHaveBeenCalled()
  })

  test("activates immediately if there is only 1 point of movement", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })
    activeId = "item1" // Simulating an already active item

    aim.enter("item2", createMouseEvent(10, 10))
    // wait() returns 0 when locs.length < 2
    expect(onActivate).toHaveBeenCalledWith("item2")
    expect(activeId).toBe("item2")
  })

  test("computes wait time correctly when moving towards the right edge", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
      delay: 500,
      tolerance: 50,
      max: 4,
    })

    // Establish an active element
    activeId = "item1"

    // Simulate mouse movements.
    // Moving from (10, 250) to (50, 250) - towards the middle right
    aim.move(createMouseEvent(10, 250))
    aim.move(createMouseEvent(50, 250))

    // Request new item
    aim.enter("item2", createMouseEvent(50, 250))

    // Should schedule a timer
    expect(mockSetTimeout).toHaveBeenCalledTimes(1)
    expect(mockSetTimeout.mock.calls[0][1]).toBe(500)
    expect(activeId).toBe("item1") // Hasn't activated yet
  })

  test("activates immediately when moving away from the right edge", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    activeId = "item1"

    // Moving away from the right edge: (150, 250) to (10, 250)
    aim.move(createMouseEvent(150, 250))
    aim.move(createMouseEvent(10, 250))

    aim.enter("item2", createMouseEvent(10, 250))

    // Activates immediately since it's moving away from the edge (slopes don't intersect the expanded edge)
    expect(onActivate).toHaveBeenCalledWith("item2")
    expect(activeId).toBe("item2")
    expect(mockSetTimeout).not.toHaveBeenCalled()
  })

  test("activates immediately if moving out of bounds", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    activeId = "item1"

    // Initial valid movement
    aim.move(createMouseEvent(10, 250))

    // Move out of bounds
    aim.move(createMouseEvent(-10, 250))

    // Request with out of bounds movement
    aim.enter("item2", createMouseEvent(-10, 250))

    // Since prev is out of bounds, wait() should return 0
    expect(onActivate).toHaveBeenCalledWith("item2")
  })

  test("delays when entering the threshold edge", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
      delay: 300,
      edge: 20
    })

    activeId = "item1"

    // Move close to right edge, distance <= 20
    aim.move(createMouseEvent(10, 250))
    aim.move(createMouseEvent(190, 250)) // rect.right is 200, so distance is 10 <= 20

    aim.enter("item2", createMouseEvent(190, 250))

    expect(mockSetTimeout).toHaveBeenCalledTimes(1)
    expect(mockSetTimeout.mock.calls[0][1]).toBe(300)
  })

  test("leave cancels pending activation and clears over state", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    activeId = "item1"

    aim.move(createMouseEvent(10, 250))
    aim.move(createMouseEvent(50, 250))

    // Triggers a timeout
    aim.enter("item2", createMouseEvent(50, 250))

    expect(mockSetTimeout).toHaveBeenCalledTimes(1)
    expect(mockClearTimeout).toHaveBeenCalledTimes(0) // cancel() is called but state.timer is undefined, so clearTimeout is skipped

    // Leave
    aim.leave("item2")

    // clearTimeout should have been called now because state.timer was set by setTimeout
    expect(mockClearTimeout).toHaveBeenCalledTimes(1)
  })

  test("reset clears all state", () => {
    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    activeId = "item1"

    aim.move(createMouseEvent(10, 250))
    aim.move(createMouseEvent(50, 250))

    aim.enter("item2", createMouseEvent(50, 250))

    aim.reset()

    expect(mockClearTimeout).toHaveBeenCalledTimes(1) // 1 from reset() since state.timer is now set

    // Now after reset, moving backwards will trigger wait() to return 0
    // because locs length is reset to 0
    aim.move(createMouseEvent(10, 250))
    aim.enter("item3", createMouseEvent(10, 250))

    expect(onActivate).toHaveBeenCalledWith("item3")
  })

  test("timer executes callback and activates if conditions are still met", () => {
    // Keep a reference to the timer callback
    let timerCallback: Function | undefined;
    mockSetTimeout.mockImplementation((fn: Function, ms: number) => {
      timerCallback = fn;
      return 123;
    });

    const aim = createAim({
      enabled: () => isEnabled,
      active: () => activeId,
      el: () => mockEl,
      onActivate,
    })

    activeId = "item1"

    // Moving towards right edge to trigger delay
    aim.move(createMouseEvent(10, 250))
    aim.move(createMouseEvent(50, 250))

    aim.enter("item2", createMouseEvent(50, 250))
    expect(timerCallback).toBeDefined()

    // simulate timer executing
    timerCallback!()

    // Should activate
    expect(onActivate).toHaveBeenCalledWith("item2")
  })
})
