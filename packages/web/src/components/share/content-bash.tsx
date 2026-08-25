import style from "./content-bash.module.css"
import { createResource, createSignal } from "solid-js"
import sanitizeHtml from "sanitize-html"
import { createOverflow, useShareMessages } from "./common"
import { codeToHtml } from "shiki"

interface Props {
  command: string
  output: string
  description?: string
  expand?: boolean
}

export function ContentBash(props: Props) {
  const messages = useShareMessages()

  const sanitizeConfig = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["span", "pre", "code", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "style"],
      pre: ["tabindex"],
      img: ["src", "alt", "title"],
    },
    allowedStyles: {
      "*": {
        color: [/^.*$/],
        "background-color": [/^.*$/],
        "font-style": [/^.*$/],
        "font-weight": [/^.*$/],
      },
    },
  }

  const [commandHtml] = createResource(
    () => props.command,
    async (command) => {
      const rawHtml = await codeToHtml(command || "", {
        lang: "bash",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      })
      return sanitizeHtml(rawHtml, sanitizeConfig)
    },
  )

  const [outputHtml] = createResource(
    () => props.output,
    async (output) => {
      const rawHtml = await codeToHtml(output || "", {
        lang: "console",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      })
      return sanitizeHtml(rawHtml, sanitizeConfig)
    },
  )

  const [expanded, setExpanded] = createSignal(false)
  const overflow = createOverflow()

  return (
    <div class={style.root} data-expanded={expanded() || props.expand === true ? true : undefined}>
      <div data-slot="body">
        <div data-slot="header">
          <span>{props.description}</span>
        </div>
        <div data-slot="content">
          <div innerHTML={commandHtml()} />
          <div data-slot="output" ref={overflow.ref} innerHTML={outputHtml()} />
        </div>
      </div>

      {!props.expand && overflow.status && (
        <button
          type="button"
          data-component="text-button"
          data-slot="expand-button"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded() ? messages.show_less : messages.show_more}
        </button>
      )}
    </div>
  )
}
