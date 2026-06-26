"use client";

import { useEffect, useState } from "react";

import { BREAKPOINTS, type Breakpoint } from "@/lib/constants/breakpoints";

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.ultrawide) return "ultrawide";
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  return "mobile";
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("mobile");

  useEffect(() => {
    const update = () => setBreakpoint(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return breakpoint;
};

export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === "desktop" || breakpoint === "ultrawide";
};
