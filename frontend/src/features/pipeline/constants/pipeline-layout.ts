export const PIPELINE_LAYOUT = {
  page: "flex min-h-0 flex-1 flex-col gap-6 min-w-0 pb-24 lg:pb-0",
  pageHeader: "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8",
  boardShell: "flex min-h-0 flex-1 flex-col px-3 lg:px-4",
  boardViewport: "flex min-h-0 flex-1 flex-col min-h-[480px] lg:max-h-[calc(100dvh-14rem)]",
  boardScroll: "flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-app",
  column:
    "flex h-full min-h-0 w-[clamp(380px,22vw,420px)] flex-shrink-0 flex-col rounded-lg border border-border/40 bg-muted/20",
  columnHeader:
    "sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80",
  columnBody: "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-y-contain p-2 scrollbar-app",
  columnDropHighlight: "ring-2 ring-primary/40 bg-primary/5",
  columnCount: "inline-flex min-w-[1.75rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground",
  cardWrapper: "mx-auto w-[calc(100%-12px)] max-w-full",
  mobileColumn: "w-full min-h-0",
  boardHint: "mt-2 text-xs text-muted-foreground",
} as const;
