import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:-translate-y-0.75 [&>svg~*]:pl-7", {
  variants: {
    variant: {
      default: "border-border bg-card text-foreground",
      success: "border-success/30 bg-success/10 text-foreground [&>svg]:text-success",
      warning: "border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning",
      danger: "border-destructive/30 bg-destructive/10 text-foreground [&>svg]:text-destructive",
      info: "border-info/30 bg-info/10 text-foreground [&>svg]:text-info",
    },
  },
  defaultVariants: { variant: "default" },
});

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
  info: Info,
};

export type AlertProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

export const Alert = ({ className, variant = "default", children, ...props }: AlertProps) => {
  const Icon = icons[variant ?? "default"];

  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );
};

export const AlertTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
);

export const AlertDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <div className={cn("text-sm text-muted-foreground **:[p]:leading-relaxed", className)} {...props} />
);
