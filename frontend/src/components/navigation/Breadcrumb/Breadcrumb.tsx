import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => (
  <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;

      return (
        <span key={item.label} className="flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : null}
          {item.href && !isLast ? (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={isLast ? "text-foreground" : "text-muted-foreground"}>
              {item.label}
            </span>
          )}
        </span>
      );
    })}
  </nav>
);

export type BreadcrumbPageProps = {
  children: ReactNode;
};

export const BreadcrumbPage = ({ children }: BreadcrumbPageProps) => (
  <span className="font-normal text-foreground">{children}</span>
);
