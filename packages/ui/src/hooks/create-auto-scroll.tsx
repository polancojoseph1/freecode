import { createEffect, on, onCleanup, createSignal } from "solid-js"
import { createResizeObserver } from "@solid-primitives/resize-observer"

export interface AutoScrollOptions {
  working: () => boolean
  onUserInteracted?: () => void
  overflowAnchor?: "none" | "auto" | "dynamic"
  bottomThreshold?: number
}

export function createAutoScroll(options: AutoScrollOptions) {
  let scroll: HTMLElement | undefined
  let settling = false
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let autoTimer: ReturnType<typeof setTimeout> | undefined
  let cleanup: (() => void) | undefined
  let auto: { top: number; time: number } | undefined

  const threshold = () => options.bottomThreshold ?? 10

  // ⚡ Bolt Optimization: Using createSignal instead of createStore for simple primitives
  // avoids unnecessary proxy overhead.
  const [contentRef, setContentRef] = createSignal<HTMLElement | undefined>(undefined)
  const [userScrolled, setUserScrolled] = createSignal(false)

  const active = () => options.working() || settling

  const distanceFromBottom = (el: HTMLElement) => {
    return el.scrollHeight - el.clientHeight - el.scrollTop
  }

  const canScroll = (el: HTMLElement) => {
    return el.scrollHeight - el.clientHeight > 1
  }

  // Browsers can dispatch scroll events asynchronously. If new content arrives
  // between us calling `scrollTo()` and the subsequent `scroll` event firing,
  // the handler can see a non-zero `distanceFromBottom` and incorrectly assume
  // the user scrolled.
  const markAuto = (el: HTMLElement) => {
    auto = {
      top: Math.max(0, el.scrollHeight - el.clientHeight),
      time: Date.now(),
    }

    if (autoTimer) clearTimeout(autoTimer)
    autoTimer = setTimeout(() => {
      auto = undefined
      autoTimer = undefined
    }, 1500)
  }

  const isAuto = (el: HTMLElement) => {
    const a = auto
    if (!a) return false

    if (Date.now() - a.time > 1500) {
      auto = undefined
      return false
    }

    return Math.abs(el.scrollTop - a.top) < 2
  }

  const scrollToBottomNow = (behavior: ScrollBehavior) => {
    const el = scroll
    if (!el) return
    markAuto(el)
    if (behavior === "smooth") {
      el.scrollTo({ top: el.scrollHeight, behavior })
      return
    }

    // `scrollTop` assignment bypasses any CSS `scroll-behavior: smooth`.
    el.scrollTop = el.scrollHeight
  }

  const scrollToBottom = (force: boolean) => {
    if (!force && !active()) return

    if (force && userScrolled()) setUserScrolled(false)

    const el = scroll
    if (!el) return

    if (!force && userScrolled()) return

    const distance = distanceFromBottom(el)
    if (distance < 2) {
      markAuto(el)
      return
    }

    // For auto-following content we prefer immediate updates to avoid
    // visible "catch up" animations while content is still settling.
    scrollToBottomNow("auto")
  }

  const stop = () => {
    const el = scroll
    if (!el) return
    if (!canScroll(el)) {
      if (userScrolled()) setUserScrolled(false)
      return
    }
    if (userScrolled()) return

    setUserScrolled(true)
    options.onUserInteracted?.()
  }

  const handleWheel = (e: WheelEvent) => {
    if (e.deltaY >= 0) return
    // If the user is scrolling within a nested scrollable region (tool output,
    // code block, etc), don't treat it as leaving the "follow bottom" mode.
    // Those regions opt in via `data-scrollable`.
    const el = scroll
    const target = e.target instanceof Element ? e.target : undefined
    const nested = target?.closest("[data-scrollable]")
    if (el && nested && nested !== el) return
    stop()
  }

  const handleScroll = () => {
    const el = scroll
    if (!el) return

    if (!canScroll(el)) {
      if (userScrolled()) setUserScrolled(false)
      return
    }

    if (distanceFromBottom(el) < threshold()) {
      if (userScrolled()) setUserScrolled(false)
      return
    }

    // Ignore scroll events triggered by our own scrollToBottom calls.
    if (!userScrolled() && isAuto(el)) {
      scrollToBottom(false)
      return
    }

    stop()
  }

  const handleInteraction = () => {
    if (!active()) return
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      stop()
    }
  }

  const updateOverflowAnchor = (el: HTMLElement) => {
    const mode = options.overflowAnchor ?? "dynamic"

    if (mode === "none") {
      el.style.overflowAnchor = "none"
      return
    }

    if (mode === "auto") {
      el.style.overflowAnchor = "auto"
      return
    }

    el.style.overflowAnchor = userScrolled() ? "auto" : "none"
  }

  createResizeObserver(
    () => contentRef(),
    () => {
      const el = scroll
      if (el && !canScroll(el)) {
        if (userScrolled()) setUserScrolled(false)
        return
      }
      if (!active()) return
      if (userScrolled()) return
      // ResizeObserver fires after layout, before paint.
      // Keep the bottom locked in the same frame to avoid visible
      // "jump up then catch up" artifacts while streaming content.
      scrollToBottom(false)
    },
  )

  createEffect(
    on(options.working, (working: boolean) => {
      settling = false
      if (settleTimer) clearTimeout(settleTimer)
      settleTimer = undefined

      if (working) {
        if (!userScrolled()) scrollToBottom(true)
        return
      }

      settling = true
      settleTimer = setTimeout(() => {
        settling = false
      }, 300)
    }),
  )

  createEffect(() => {
    // Track `userScrolled` even before `scrollRef` is attached, so we can
    // update overflow anchoring once the element exists.
    userScrolled()
    const el = scroll
    if (!el) return
    updateOverflowAnchor(el)
  })

  onCleanup(() => {
    if (settleTimer) clearTimeout(settleTimer)
    if (autoTimer) clearTimeout(autoTimer)
    if (cleanup) cleanup()
  })

  return {
    scrollRef: (el: HTMLElement | undefined) => {
      if (cleanup) {
        cleanup()
        cleanup = undefined
      }

      scroll = el

      if (!el) return

      updateOverflowAnchor(el)
      el.addEventListener("wheel", handleWheel, { passive: true })

      cleanup = () => {
        el.removeEventListener("wheel", handleWheel)
      }
    },
    contentRef: (el: HTMLElement | undefined) => setContentRef(el),
    handleScroll,
    handleInteraction,
    pause: stop,
    resume: () => {
      if (userScrolled()) setUserScrolled(false)
      scrollToBottom(true)
    },
    scrollToBottom: () => scrollToBottom(false),
    forceScrollToBottom: () => scrollToBottom(true),
    userScrolled: () => userScrolled(),
  }
}
