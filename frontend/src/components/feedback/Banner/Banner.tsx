import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const bannerVariants = cva("w-full border-b px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-card text-foreground",
      info: "border-info/30 bg-info/10 text-foreground",
      warning: "border-warning/30 bg-warning/10 text-foreground",
      success: "border-success/30 bg-success/10 text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export type BannerProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof bannerVariants>;

export const Banner = ({ className, variant, ...props }: BannerProps) => (
  <div className={cn(bannerVariants({ variant }), className)} {...props} />
);
