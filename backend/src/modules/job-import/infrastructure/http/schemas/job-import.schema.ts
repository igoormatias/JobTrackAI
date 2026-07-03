import { z } from "zod";

export const previewJobImportSchema = z.object({
  url: z.string().url(),
});

export const confirmJobImportSchema = z.object({
  url: z.string().url(),
  addToPipeline: z.boolean().optional().default(false),
});

export type PreviewJobImportBody = z.infer<typeof previewJobImportSchema>;
export type ConfirmJobImportBody = z.infer<typeof confirmJobImportSchema>;
