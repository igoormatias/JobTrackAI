import type { Request, Response } from "express";

import { getRouteParam } from "../../../../../shared/http/get-route-param.js";
import type { GetProviderHistoryUseCase } from "../../../application/use-cases/get-provider-stats.use-cases.js";
import type { GetProviderStatisticsUseCase } from "../../../application/use-cases/get-provider-stats.use-cases.js";
import type {
  GetProvidersHealthUseCase,
  GetProvidersUseCase,
} from "../../../application/use-cases/get-providers.use-cases.js";
import type {
  RunAllProvidersUseCase,
  RunProviderUseCase,
} from "../../../application/use-cases/run-providers.use-cases.js";

export class ProviderController {
  constructor(
    private readonly getProvidersUseCase: GetProvidersUseCase,
    private readonly getStatisticsUseCase: GetProviderStatisticsUseCase,
    private readonly getHistoryUseCase: GetProviderHistoryUseCase,
    private readonly getHealthUseCase: GetProvidersHealthUseCase,
    private readonly runAllUseCase: RunAllProvidersUseCase,
    private readonly runProviderUseCase: RunProviderUseCase,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.getProvidersUseCase.execute();
    res.json({ data });
  };

  statistics = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.getStatisticsUseCase.execute();
    res.json({ data });
  };

  history = async (req: Request, res: Response): Promise<void> => {
    const providerName = typeof req.query.provider === "string" ? req.query.provider : undefined;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

    const data = await this.getHistoryUseCase.execute({
      providerName,
      cursor,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    res.json(data);
  };

  health = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.getHealthUseCase.execute();
    res.json({ data });
  };

  runAll = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.runAllUseCase.execute();
    res.status(202).json({ data });
  };

  runOne = async (req: Request, res: Response): Promise<void> => {
    const provider = getRouteParam(req, "provider");
    const data = await this.runProviderUseCase.execute(provider);
    res.status(202).json({ data });
  };
}
