export const PIPELINE_LAYOUT = {
  page: "flex min-h-0 flex-1 flex-col gap-6 min-w-0 pb-24 lg:pb-0",
  pageHeader: "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8",
  boardShell: "flex min-h-0 flex-1 flex-col px-3 lg:px-4",
  boardViewport: "flex min-h-0 flex-1 flex-col min-h-[480px] lg:max-h-[calc(100dvh-14rem)]",
  boardScroll:
    "flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth scrollbar-app",
  column:
    "flex h-full min-h-0 w-[clamp(280px,18vw,340px)] flex-shrink-0 flex-col rounded-lg border border-border/40 bg-muted/20 transition-[box-shadow,background-color,border-color] duration-150",
  columnHeader:
    "sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80",
  columnBody:
    "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-2.5 scrollbar-app min-h-[160px]",
  columnDropHighlight:
    "ring-2 ring-primary/60 border-primary/40 bg-primary/10 shadow-[inset_0_0_0_1px] shadow-primary/40 scale-[1.01]",
  columnCount:
    "inline-flex min-w-[1.75rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground",
  cardWrapper: "mx-auto w-full max-w-full",
  mobileColumn: "w-full min-h-0",
  boardHint: "mt-2 text-xs text-muted-foreground",
} as const;
