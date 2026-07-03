// pdf-parse v2 exposes PDFParse class; fallback for older default export API
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type PdfParseFn = (buffer: Buffer) => Promise<{ text: string }>;

const loadPdfParse = (): PdfParseFn => {
  try {
    const mod = require("pdf-parse") as PdfParseFn | { default: PdfParseFn };
    return typeof mod === "function" ? mod : mod.default;
  } catch {
    throw new Error("pdf-parse is not available");
  }
};

export const parsePdfBuffer = async (buffer: Buffer): Promise<string> => {
  const pdfParse = loadPdfParse();
  const result = await pdfParse(buffer);
  return result.text.trim();
};
