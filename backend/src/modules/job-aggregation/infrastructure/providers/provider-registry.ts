import type { JobProviderPort } from "../../domain/ports/job-provider.port.js";
import { gupyProvider } from "../../../../providers/gupy/gupy.provider.js";
import { linkedinProvider } from "../../../../providers/linkedin/linkedin.provider.js";
import { programathorProvider } from "../../../../providers/programathor/programathor.provider.js";

export const createProviderMap = (): Map<string, JobProviderPort> => {
  const map = new Map<string, JobProviderPort>();
  map.set(gupyProvider.providerName, gupyProvider);
  map.set(linkedinProvider.providerName, linkedinProvider);
  map.set(programathorProvider.providerName, programathorProvider);
  return map;
};
