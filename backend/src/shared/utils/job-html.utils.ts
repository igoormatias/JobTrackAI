import { load } from "cheerio";

/**
 * Sanitize job description HTML for safe frontend rendering.
 * Allows a whitelist of tags used by Gupy/Programathor/LinkedIn listings.
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

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "rel", "target"]),
};

export const sanitizeJobHtml = (html: string | null | undefined): string | null => {
  if (!html?.trim()) return null;

  const $ = load(`<div id="root">${html}</div>`, { xml: false });
  const root = $("#root");

  root.find("*").each((_, element) => {
    const el = $(element);
    const tag = element.tagName?.toLowerCase() ?? "";

    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(el.html() ?? el.text());
      return;
    }

    const allowed = ALLOWED_ATTRS[tag] ?? new Set<string>();
    const attribs = element.attribs ?? {};
    for (const attr of Object.keys(attribs)) {
      if (!allowed.has(attr.toLowerCase())) {
        el.removeAttr(attr);
      }
    }

    if (tag === "a") {
      const href = el.attr("href") ?? "";
      if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:")) {
        el.removeAttr("href");
      }
      el.attr("rel", "noopener noreferrer");
      el.attr("target", "_blank");
    }
  });

  // Normalize empty paragraphs
  let result = root.html() ?? "";
  result = result
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .trim();

  return result || null;
};

/**
 * Convert semi-broken concatenated text (e.g. "ResponsabilidadesAtuar...") into paragraphs.
 */
export const normalizeGluedDescription = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/([a-záéíóúãõç])([A-ZÁÉÍÓÚÃÕÇ])/g, "$1\n\n$2")
    .replace(/([.;:])([A-ZÁÉÍÓÚÃÕÇ])/g, "$1\n\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const htmlToPlainText = (html: string): string => {
  const sanitized = sanitizeJobHtml(html);
  if (!sanitized) return "";
  const $ = load(`<div>${sanitized}</div>`);
  $("br").replaceWith("\n");
  $("p,li,div,h1,h2,h3,h4,h5,h6").each((_, el) => {
    const node = $(el);
    node.append("\n");
  });
  return normalizeGluedDescription($.text().replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim());
};

export type StructuredJobSections = {
  descriptionHtml: string | null;
  descriptionText: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  technologies: string[];
};

const SECTION_PATTERNS: Array<{ key: keyof Omit<StructuredJobSections, "descriptionHtml" | "descriptionText" | "technologies">; patterns: RegExp[] }> = [
  {
    key: "responsibilities",
    patterns: [/responsabilidades?/i, /atribui[cç][oõ]es/i, /o que voc[eê] vai fazer/i, /suas atividades/i],
  },
  {
    key: "requirements",
    patterns: [/requisitos?/i, /o que buscamos/i, /necess[aá]rio/i, /obrigat[oó]ri/i, /qualifica[cç]/i], /experi[eê]ncia/i],
  },
  {
    key: "benefits",
    patterns: [/benef[ií]cios?/i, /oferecemos/i, /perks?/i, /vantagens/i],
  },
];

export const extractSectionsFromHtml = (html: string): StructuredJobSections => {
  const descriptionHtml = sanitizeJobHtml(html);
  const descriptionText = htmlToPlainText(html);
  const requirements: string[] = [];
  const responsibilities: string[] = [];
  const benefits: string[] = [];
  const technologies: string[] = [];

  if (!descriptionHtml) {
    return {
      descriptionHtml: null,
      descriptionText: normalizeGluedDescription(html),
      requirements,
      responsibilities,
      benefits,
      technologies,
    };
  }

  const $ = load(`<div id="root">${descriptionHtml}</div>`);
  let current: "requirements" | "responsibilities" | "benefits" | null = null;

  $("#root")
    .children()
    .each((_, element) => {
      const el = $(element);
      const text = el.text().trim();
      if (!text) return;

      for (const section of SECTION_PATTERNS) {
        if (section.patterns.some((pattern) => pattern.test(text) && text.length < 80)) {
          current = section.key;
          return;
        }
      }

      const items = el
        .find("li")
        .map((__, li) => $(li).text().trim())
        .get()
        .filter(Boolean);

      if (items.length > 0 && current) {
        if (current === "requirements") requirements.push(...items);
        if (current === "responsibilities") responsibilities.push(...items);
        if (current === "benefits") benefits.push(...items);
        return;
      }

      if (current && text.length > 3 && text.length < 300) {
        if (current === "requirements") requirements.push(text);
        if (current === "responsibilities") responsibilities.push(text);
        if (current === "benefits") benefits.push(text);
      }
    });

  return {
    descriptionHtml,
    descriptionText,
    requirements: [...new Set(requirements)],
    responsibilities: [...new Set(responsibilities)],
    benefits: [...new Set(benefits)],
    technologies,
  };
};
