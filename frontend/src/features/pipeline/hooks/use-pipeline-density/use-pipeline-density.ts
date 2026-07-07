"use client";

import { useCallback, useEffect, useState } from "react";

export type PipelineDensity = "default" | "compact";

const STORAGE_KEY = "pipeline-density";

const readDensity = (): PipelineDensity => {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "compact" ? "compact" : "default";
};

export const usePipelineDensity = () => {
  const [density, setDensityState] = useState<PipelineDensity>("default");

  useEffect(() => {
    setDensityState(readDensity());
  }, []);

  const setDensity = useCallback((value: PipelineDensity) => {
    setDensityState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const toggleCompact = useCallback(() => {
    setDensity(density === "compact" ? "default" : "compact");
  }, [density, setDensity]);

  return { density, setDensity, toggleCompact, isCompact: density === "compact" };
};
