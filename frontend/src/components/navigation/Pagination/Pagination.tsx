import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => (
  <div className={cn("flex items-center justify-center gap-2", className)}>
    <Button
      variant="outline"
      size="icon"
      onClick={() => onPageChange(page - 1)}
      disabled={page <= 1}
      aria-label="Página anterior"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <span className="text-sm text-muted-foreground">
      {page} / {totalPages}
    </span>
    <Button
      variant="outline"
      size="icon"
      onClick={() => onPageChange(page + 1)}
      disabled={page >= totalPages}
      aria-label="Próxima página"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);
