import DOMPurify from "isomorphic-dompurify"

if (DOMPurify.isSupported) {
  DOMPurify.addHook("afterSanitizeAttributes", (node: any) => {
    if (!(node instanceof HTMLAnchorElement)) return
    if (node.target !== "_blank") return

    const rel = node.getAttribute("rel") ?? ""
    const set = new Set(rel.split(/\s+/).filter(Boolean))
    set.add("noopener")
    set.add("noreferrer")
    node.setAttribute("rel", Array.from(set).join(" "))
  })
}

const config = {
  USE_PROFILES: { html: true, mathMl: true },
  SANITIZE_NAMED_PROPS: true,
  FORBID_TAGS: ["style"],
  FORBID_CONTENTS: ["style", "script"],
  ALLOWED_TAGS: ["span", "pre", "code", "img", "div", "p", "a", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "strong", "em", "del", "table", "thead", "tbody", "tr", "th", "td", "br", "hr"],
  ALLOWED_ATTR: ["class", "style", "tabindex", "href", "title", "src", "alt", "target", "rel", "data-flush", "data-slot", "data-highlight", "data-expanded"],
}

export function sanitize(html: string) {
  return DOMPurify.sanitize(html, config)
}
