import type { NextFunction, Request, Response } from "express";

import type { NormalizeSkillsUseCase, SearchSkillsCatalogUseCase } from "../../../application/use-cases/skills.use-cases.js";
import { normalizeSkillsSchema, skillsCatalogQuerySchema } from "../schemas/ai-skills.schema.js";

export class AiSkillsController {
  constructor(
    private readonly searchSkills: SearchSkillsCatalogUseCase,
    private readonly normalizeSkills: NormalizeSkillsUseCase,
  ) {}

  catalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = skillsCatalogQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }

      const data = await this.searchSkills.execute(parsed.data.q, parsed.data.limit);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };

  normalize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = normalizeSkillsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
      }

      const data = await this.normalizeSkills.execute(parsed.data.skills);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  };
}
