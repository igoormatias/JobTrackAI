/**
 * Lightweight HTML sanitizer (no external deps).
 * Allows the same whitelist used by the backend job HTML utils.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "span",
  "a",
]);

const stripDangerous = (html: string): string =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");

export const sanitizeJobDescriptionHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // SSR: strip scripts and keep tags loosely; DOMPurify-like full sanitize on client
    return stripDangerous(html);
  }

  const template = document.createElement("template");
  template.innerHTML = stripDangerous(html);

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          el.replaceWith(...Array.from(el.childNodes));
          continue;
        }
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (tag === "a" && (name === "href" || name === "title" || name === "rel" || name === "target")) {
            if (name === "href") {
              const href = el.getAttribute("href") ?? "";
              if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:")) {
                el.removeAttribute("href");
              } else {
                el.setAttribute("rel", "noopener noreferrer");
                el.setAttribute("target", "_blank");
              }
            }
            continue;
          }
          el.removeAttribute(attr.name);
        }
        walk(el);
      }
    }
  };

  walk(template.content);
  return template.innerHTML;
};
