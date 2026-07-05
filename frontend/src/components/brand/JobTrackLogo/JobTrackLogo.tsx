import Image from "next/image";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";

export type JobTrackLogoVariant = "full" | "mark";
export type JobTrackLogoTheme = "dark" | "light" | "mono";

export type JobTrackLogoProps = {
  className?: string;
  variant?: JobTrackLogoVariant;
  theme?: JobTrackLogoTheme;
  priority?: boolean;
};

const LOGO_SOURCES: Record<JobTrackLogoVariant, Record<JobTrackLogoTheme, string>> = {
  full: {
    dark: siteConfig.logo,
    light: "/brand/logo-light.svg",
    mono: "/brand/logo-mono.svg",
  },
  mark: {
    dark: siteConfig.logoMark,
    light: siteConfig.logoMark,
    mono: siteConfig.logoMark,
  },
};

const LOGO_DIMENSIONS: Record<JobTrackLogoVariant, { width: number; height: number; className: string }> = {
  full: { width: 260, height: 48, className: "h-10 w-auto sm:h-11" },
  mark: { width: 48, height: 48, className: "h-11 w-11 sm:h-12 sm:w-12" },
};

export const JobTrackLogo = ({
  className,
  variant = "full",
  theme = "dark",
  priority = false,
}: JobTrackLogoProps) => {
  const dimensions = LOGO_DIMENSIONS[variant];
  const src = LOGO_SOURCES[variant][theme];

  return (
    <Image
      src={src}
      alt={siteConfig.name}
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      className={cn(
        dimensions.className,
        theme === "mono" && variant === "full" && "text-foreground",
        className,
      )}
    />
  );
};
