import type { ProfileLocation } from "@/types";

import { getStateLabel } from "../constants/brazil-states";

export const formatLocationPreference = (location: ProfileLocation): string => {
  if (location.scope === "country") {
    return "Brasil inteiro";
  }

  if (location.scope === "state") {
    return location.state ? getStateLabel(location.state) : "Estado";
  }

  return location.city?.trim() ? location.city : "Cidade";
};

export const formatLocationWithRelocation = (location: ProfileLocation): string => {
  const base = formatLocationPreference(location);
  return location.acceptsRelocation ? `${base} · Aceita mudança` : base;
};
