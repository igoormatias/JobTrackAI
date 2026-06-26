import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const headingVariants = cva("font-semibold tracking-tight text-foreground", {
  variants: {
    level: {
      1: "text-3xl lg:text-4xl",
      2: "text-2xl lg:text-3xl",
      3: "text-xl lg:text-2xl",
      4: "text-lg lg:text-xl",
    },
  },
  defaultVariants: {
    level: 1,
  },
});

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
} as const;

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants>;

export const Heading = ({ className, level = 1, ...props }: HeadingProps) => {
  const Tag = headingTags[level ?? 1];

  return <Tag className={cn(headingVariants({ level }), className)} {...props} />;
};
