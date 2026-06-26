export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  ultrawide: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
