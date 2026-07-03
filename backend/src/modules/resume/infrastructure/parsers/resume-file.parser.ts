import { parseDocxBuffer } from "./docx.parser.js";
import { parsePdfBuffer } from "./pdf.parser.js";
import { parseTxtBuffer } from "./txt.parser.js";

export type ResumeFileFormat = "pdf" | "docx" | "txt";

export const detectFormat = (mimetype: string, filename: string): ResumeFileFormat | null => {
  const lower = filename.toLowerCase();
  if (mimetype === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    return "docx";
  }
  if (mimetype === "text/plain" || lower.endsWith(".txt")) return "txt";
  return null;
};

export const extractTextFromFile = async (
  buffer: Buffer,
  format: ResumeFileFormat,
): Promise<string> => {
  switch (format) {
    case "pdf":
      return parsePdfBuffer(buffer);
    case "docx":
      return parseDocxBuffer(buffer);
    case "txt":
      return parseTxtBuffer(buffer);
    default:
      throw new Error("Unsupported format");
  }
};
