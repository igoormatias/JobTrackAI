import pdf from "pdf-parse";

export const parsePdfBuffer = async (buffer: Buffer): Promise<string> => {
  const result = await pdf(buffer);
  return result.text.trim();
};
