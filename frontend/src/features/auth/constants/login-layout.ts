export const LOGIN_LAYOUT = {
  page: "relative min-h-screen w-full overflow-x-hidden",
  grid:
    "relative z-10 mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,480px)] lg:items-start lg:gap-12 lg:px-10 lg:py-14 xl:px-14",
  heroPanel: "order-2 flex min-w-0 flex-col justify-start lg:order-1 lg:pt-4",
  authPanel: "order-1 flex min-w-0 flex-col justify-start lg:order-2 lg:sticky lg:top-8",
  authCard:
    "w-full min-h-[380px] rounded-2xl border border-border/80 bg-card/90 p-8 shadow-xl backdrop-blur-xl sm:min-h-[400px] sm:p-10",
  authStack: "flex flex-col gap-6 sm:gap-8",
  heroTitle:
    "break-words text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl xl:text-[2.75rem] xl:leading-tight",
  heroHighlight: "bg-gradient-to-r from-primary via-indigo-400 to-violet-400 bg-clip-text text-transparent",
  heroSubtitle: "max-w-xl break-words text-base leading-relaxed text-muted-foreground sm:text-lg",
  productGrid: "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4",
  productCard:
    "min-w-0 rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/70",
  legal: "break-words text-center text-xs leading-relaxed text-muted-foreground lg:text-left",
  footer: "text-xs text-muted-foreground",
  /** @deprecated Legacy LoginCard layout */
  shell: "layout-shell w-full max-w-[400px]",
  card: "w-full rounded-xl border border-border bg-card p-6 sm:p-8 shadow-md",
  stack: "flex flex-col items-center gap-6 sm:gap-8",
  tagline: "text-center text-base text-muted-foreground leading-relaxed",
  benefitGrid: "grid gap-3 sm:grid-cols-2",
  benefitCard:
    "group rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/60",
} as const;
