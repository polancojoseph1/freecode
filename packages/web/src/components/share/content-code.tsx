import { codeToHtml, bundledLanguages } from "shiki"
import { createResource, Suspense } from "solid-js"
import style from "./content-code.module.css"
import sanitizeHtml from "sanitize-html"

interface Props {
  code: string
  lang?: string
  flush?: boolean
}
function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["span", "pre", "code", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      pre: ["class", "style", "tabindex"],
      code: ["class", "style", "dir"],
      span: ["class", "style", "line"],
      img: ["src", "alt", "title"],
    },
    allowedStyles: {
      "*": {
        color: [/.*/],
        "background-color": [/.*/],
        "font-style": [/.*/],
        "font-weight": [/.*/],
        "--shiki-dark": [/.*/],
        "--shiki-dark-bg": [/.*/],
      },
    },
  })
}

export function ContentCode(props: Props) {
  const [html] = createResource(
    () => [props.code, props.lang],
    async ([code, lang]) => {
      return sanitize(
        (await codeToHtml(code || "", {
          lang: lang && lang in bundledLanguages ? lang : "text",
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        })) as string,
      )
    },
  )
  return (
    <Suspense>
      <div innerHTML={html()} class={style.root} data-flush={props.flush === true ? true : undefined} />
    </Suspense>
  )
}
