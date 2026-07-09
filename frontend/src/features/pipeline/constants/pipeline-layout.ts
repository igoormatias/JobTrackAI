/** Shared column width tokens — keep column + drag overlay in sync */
export const PIPELINE_COLUMN_WIDTH = "clamp(320px, 20vw, 380px)" as const;

export const PIPELINE_LAYOUT = {
  page: "flex min-h-0 flex-1 flex-col gap-6 min-w-0 pb-24 lg:pb-0",
  pageHeader: "mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8",
  boardShell: "flex min-h-0 flex-1 flex-col px-3 lg:px-4 2xl:px-6",
  boardViewport: "flex min-h-0 flex-1 flex-col min-h-[480px] lg:max-h-[calc(100dvh-14rem)]",
  boardScroll:
    "flex h-full min-h-0 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth scrollbar-app 2xl:gap-5",
  column:
    "flex h-full min-h-0 w-[clamp(320px,20vw,380px)] flex-shrink-0 flex-col rounded-lg border border-border/40 bg-muted/20 transition-[box-shadow,background-color,border-color,transform] duration-200",
  columnHeader:
    "sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80",
  columnBody:
    "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain p-3 scrollbar-app min-h-[200px]",
  columnDropHighlight:
    "ring-2 ring-primary/70 border-primary/50 bg-primary/15 shadow-[inset_0_0_0_2px] shadow-primary/30 scale-[1.015]",
  columnCount:
    "inline-flex min-w-[1.75rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground",
  cardWrapper: "mx-auto w-full max-w-full",
  mobileColumn: "w-full min-h-0",
  boardHint: "mt-2 text-xs text-muted-foreground",
} as const;
