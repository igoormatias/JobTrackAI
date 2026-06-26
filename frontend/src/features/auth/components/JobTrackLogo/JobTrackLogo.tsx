import { Briefcase } from "lucide-react";

import { cn } from "@/lib/utils";

export type JobTrackLogoProps = {
  className?: string;
  showText?: boolean;
};

export const JobTrackLogo = ({ className, showText = true }: JobTrackLogoProps) => (
  <div className={cn("flex flex-col items-center gap-3", className)}>
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
      <Briefcase className="h-7 w-7" />
    </div>
    {showText ? <span className="text-2xl font-bold text-foreground">JobTrack AI</span> : null}
  </div>
);
