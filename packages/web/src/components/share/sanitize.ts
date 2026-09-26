import DOMPurify from "isomorphic-dompurify"

// 🛡️ Sentinel: Sanitize HTML to prevent SSR XSS vulnerabilities before rendering to the DOM via innerHTML.
const config = {
  ALLOWED_TAGS: ["span", "pre", "code", "img", "a", "div", "p", "br", "ul", "ol", "li", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "hr"],
  ALLOWED_ATTR: ["class", "style", "tabindex", "href", "target", "rel", "title", "alt", "src"]
}

export function sanitize(html: string) {
  return DOMPurify.sanitize(html, config) as string
}
