import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip"
import { createEffect, createSignal, Match, onCleanup, splitProps, Switch, type JSX } from "solid-js"
import type { ComponentProps } from "solid-js"

export interface TooltipProps extends ComponentProps<typeof KobalteTooltip> {
  value: JSX.Element
  class?: string
  contentClass?: string
  contentStyle?: JSX.CSSProperties
  inactive?: boolean
  forceOpen?: boolean
}

export interface TooltipKeybindProps extends Omit<TooltipProps, "value"> {
  title: string
  keybind: string
}

export function TooltipKeybind(props: TooltipKeybindProps) {
  const [local, others] = splitProps(props, ["title", "keybind"])
  return (
    <Tooltip
      {...others}
      value={
        <div data-slot="tooltip-keybind">
          <span>{local.title}</span>
          <span data-slot="tooltip-keybind-key">{local.keybind}</span>
        </div>
      }
    />
  )
}

export function Tooltip(props: TooltipProps) {
  let ref: HTMLDivElement | undefined
  // ⚡ Bolt Optimization: Using createSignal instead of createStore for simple primitives
  const [open, setOpen] = createSignal(false)
  const [block, setBlock] = createSignal(false)
  const [expand, setExpand] = createSignal(false)

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "contentClass",
    "contentStyle",
    "inactive",
    "forceOpen",
    "ignoreSafeArea",
    "value",
  ])

  const close = () => setOpen(false)

  const inside = () => {
    const active = document.activeElement
    if (!ref || !active) return false
    return ref.contains(active)
  }

  const drop = (isExpanded = expand()) => {
    if (isExpanded) return
    if (ref?.matches(":hover")) return
    if (inside()) return
    setBlock(false)
  }

  const sync = () => {
    const isExpanded = !!ref?.querySelector('[aria-expanded="true"], [data-expanded]')
    setExpand(isExpanded)
    if (isExpanded) {
      setBlock(true)
      close()
      return
    }
    drop(isExpanded)
  }

  const arm = () => {
    setBlock(true)
    close()
  }

  const leave = () => {
    if (!inside()) close()
    drop()
  }

  createEffect(() => {
    if (!ref) return
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(ref, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-expanded", "data-expanded"],
    })
    onCleanup(() => obs.disconnect())
  })

  return (
    <Switch>
      <Match when={local.inactive}>{local.children}</Match>
      <Match when={true}>
        <KobalteTooltip
          gutter={4}
          {...others}
          closeDelay={0}
          ignoreSafeArea={local.ignoreSafeArea ?? true}
          open={local.forceOpen || open()}
          onOpenChange={(isOpen) => {
            if (local.forceOpen) return
            if (block() && isOpen) return
            setOpen(isOpen)
          }}
        >
          <KobalteTooltip.Trigger
            ref={ref}
            as={"div"}
            data-component="tooltip-trigger"
            class={local.class}
            onPointerDownCapture={arm}
            onKeyDownCapture={(event: KeyboardEvent) => {
              if (event.key !== "Enter" && event.key !== " ") return
              arm()
            }}
            onPointerLeave={leave}
            onFocusOut={() => requestAnimationFrame(() => drop())}
          >
            {local.children}
          </KobalteTooltip.Trigger>
          <KobalteTooltip.Portal>
            <KobalteTooltip.Content
              data-component="tooltip"
              data-placement={props.placement}
              data-force-open={local.forceOpen}
              class={local.contentClass}
              style={local.contentStyle}
            >
              {local.value}
              {/* <KobalteTooltip.Arrow data-slot="tooltip-arrow" /> */}
            </KobalteTooltip.Content>
          </KobalteTooltip.Portal>
        </KobalteTooltip>
      </Match>
    </Switch>
  )
}
