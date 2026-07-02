import { Briefcase } from "lucide-react";

import { cn } from "@/lib/utils";

export type JobTrackLogoProps = {
  className?: string;
  showText?: boolean;
};

export const JobTrackLogo = ({ className, showText = true }: JobTrackLogoProps) => (
  <div className={cn("flex flex-col items-center gap-3", className)}>
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
      <Briefcase className="h-8 w-8" />
    </div>
    {showText ? (
      <span id="login-title" className="text-2xl font-bold text-foreground sm:text-3xl">
        JobTrack AI
      </span>
    ) : null}
  </div>
);
