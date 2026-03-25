import { createEffect, onCleanup, Show, createSignal, type ValidComponent } from "solid-js"
import { Dynamic } from "solid-js/web"

export const Typewriter = <T extends ValidComponent = "p">(props: { text?: string; class?: string; as?: T }) => {
  // ⚡ Bolt Optimization: Using createSignal instead of createStore for simple primitives
  // avoids unnecessary proxy overhead during high-frequency updates like typing animations.
  const [typing, setTyping] = createSignal(false)
  const [displayed, setDisplayed] = createSignal("")
  const [cursor, setCursor] = createSignal(true)

  createEffect(() => {
    const text = props.text
    if (!text) return

    let i = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []
    setTyping(true)
    setDisplayed("")
    setCursor(true)

    const getTypingDelay = () => {
      const random = Math.random()
      if (random < 0.05) return 150 + Math.random() * 100
      if (random < 0.15) return 80 + Math.random() * 60
      return 30 + Math.random() * 50
    }

    const type = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
        timeouts.push(setTimeout(type, getTypingDelay()))
      } else {
        setTyping(false)
        timeouts.push(setTimeout(() => setCursor(false), 2000))
      }
    }

    timeouts.push(setTimeout(type, 200))

    onCleanup(() => {
      for (const timeout of timeouts) clearTimeout(timeout)
    })
  })

  return (
    <Dynamic component={props.as || "p"} class={props.class}>
      {displayed()}
      <Show when={cursor()}>
        <span classList={{ "blinking-cursor": !typing() }}>│</span>
      </Show>
    </Dynamic>
  )
}
