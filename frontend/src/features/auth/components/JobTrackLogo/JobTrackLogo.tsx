import Image from "next/image";

import { cn } from "@/lib/utils";

export type JobTrackLogoProps = {
  className?: string;
  showText?: boolean;
};

export const JobTrackLogo = ({ className, showText = true }: JobTrackLogoProps) => (
  <div className={cn("flex flex-col items-center gap-3", className)}>
    <Image
      src={showText ? "/brand/logo.svg" : "/brand/logo-mark.svg"}
      alt="JobTrack AI"
      width={showText ? 220 : 64}
      height={showText ? 48 : 64}
      priority
      className={cn(showText ? "h-12 w-auto" : "h-16 w-16")}
    />
  </div>
);
