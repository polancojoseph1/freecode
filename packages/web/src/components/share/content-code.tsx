import { codeToHtml, bundledLanguages } from "shiki"
import { createResource, Suspense } from "solid-js"
import sanitizeHtml from "sanitize-html"
import style from "./content-code.module.css"

interface Props {
  code: string
  lang?: string
  flush?: boolean
}
export function ContentCode(props: Props) {
  const [html] = createResource(
    () => [props.code, props.lang],
    async ([code, lang]) => {
      const rawHtml = (await codeToHtml(code || "", {
        lang: lang && lang in bundledLanguages ? lang : "text",
        themes: {
          light: "github-light",
          dark: "github-dark",
        },
      })) as string
      return sanitizeHtml(rawHtml, {
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
      })
    },
  )
  return (
    <Suspense>
      <div innerHTML={html()} class={style.root} data-flush={props.flush === true ? true : undefined} />
    </Suspense>
  )
}
