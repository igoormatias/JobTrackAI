import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export type CompanyBadgeProps = {
  name: string;
  logoUrl?: string;
  className?: string;
};

export const CompanyBadge = ({ name, logoUrl, className }: CompanyBadgeProps) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Avatar className="h-6 w-6 rounded-md">
      {logoUrl ? <AvatarImage src={logoUrl} alt={name} /> : null}
      <AvatarFallback className="rounded-md text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <span className="text-sm text-foreground">{name}</span>
  </div>
);
