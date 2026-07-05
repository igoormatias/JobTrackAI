import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";

export type LoginSiteFooterProps = {
  className?: string;
};

export const LoginSiteFooter = ({ className }: LoginSiteFooterProps) => (
  <footer
    className={cn(
      "flex flex-col items-center gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between lg:text-left",
      className,
    )}
  >
    <p>v{siteConfig.version}</p>
    <a href={`mailto:${siteConfig.contactEmail}`} className="transition-colors hover:text-foreground">
      Contato
    </a>
  </footer>
);
