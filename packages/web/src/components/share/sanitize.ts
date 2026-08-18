import sanitizeHtml from "sanitize-html"

export const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["span", "pre", "code", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    span: ["class", "style"],
    pre: ["class", "style", "tabindex"],
    code: ["class", "style"],
  },
  allowedStyles: {
    "*": {
      color: [/.*/],
      "background-color": [/.*/],
      "font-style": [/.*/],
      "font-weight": [/.*/],
    },
  },
}

export function sanitize(html: string) {
  return sanitizeHtml(html, sanitizeOptions)
}
