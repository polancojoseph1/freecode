import { marked } from "marked"
import { codeToHtml } from "shiki"
import markedShiki from "marked-shiki"
import sanitizeHtml from "sanitize-html"
import { createOverflow, useShareMessages } from "./common"
import { CopyButton } from "./copy-button"
import { createResource, createSignal } from "solid-js"
import style from "./content-markdown.module.css"

const sanitizeConfig: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["span", "pre", "code", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "style", "tabindex"],
  },
  allowedStyles: {
    "*": {
      color: [/.*/],
      "background-color": [/.*/],
      "font-style": [/.*/],
      "font-weight": [/.*/],
      "text-decoration": [/.*/],
      "--shiki-dark": [/.*/],
      "--shiki-light": [/.*/],
      "--shiki-dark-bg": [/.*/],
      "--shiki-light-bg": [/.*/],
      "--shiki-dark-font-style": [/.*/],
      "--shiki-light-font-style": [/.*/],
      "--shiki-dark-font-weight": [/.*/],
      "--shiki-light-font-weight": [/.*/],
      "--shiki-dark-text-decoration": [/.*/],
      "--shiki-light-text-decoration": [/.*/],
    },
  },
}

const markedWithShiki = marked.use(
  {
    renderer: {
      link({ href, title, text }) {
        const titleAttr = title ? ` title="${title}"` : ""
        return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
      },
    },
  },
  markedShiki({
    highlight(code, lang) {
      return codeToHtml(code, {
        lang: lang || "text",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      })
    },
  }),
)

interface Props {
  text: string
  expand?: boolean
  highlight?: boolean
}
export function ContentMarkdown(props: Props) {
  const [html] = createResource(
    () => strip(props.text),
    async (markdown) => {
      const rawHtml = await markedWithShiki.parse(markdown)
      return sanitizeHtml(rawHtml, sanitizeConfig)
    },
  )
  const [expanded, setExpanded] = createSignal(false)
  const overflow = createOverflow()
  const messages = useShareMessages()

  return (
    <div
      class={style.root}
      data-highlight={props.highlight === true ? true : undefined}
      data-expanded={expanded() || props.expand === true ? true : undefined}
    >
      <div data-slot="markdown" ref={overflow.ref} innerHTML={html()} />

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
      <CopyButton text={props.text} />
    </div>
  )
}

function strip(text: string): string {
  const wrappedRe = /^\s*<([A-Za-z]\w*)>\s*([\s\S]*?)\s*<\/\1>\s*$/
  const match = text.match(wrappedRe)
  return match ? match[2] : text
}
