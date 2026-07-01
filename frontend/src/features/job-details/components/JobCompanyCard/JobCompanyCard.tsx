import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCompanyInitials } from "@/features/jobs/utils/job-formatters";

import type { JobDetailsCompany } from "../../types/job-details.types";

export type JobCompanyCardProps = {
  company: JobDetailsCompany;
};

export const JobCompanyCard = ({ company }: JobCompanyCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Empresa</CardTitle>
    </CardHeader>
    <CardContent className="flex items-start gap-3">
      <Avatar className="h-12 w-12">
        {company.logoUrl ? <AvatarImage src={company.logoUrl} alt={company.name} /> : null}
        <AvatarFallback>{getCompanyInitials(company.name)}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <div>
          <p className="font-semibold text-foreground">{company.name}</p>
          <p className="text-sm text-muted-foreground">{company.industry}</p>
          <p className="text-xs text-muted-foreground">{company.jobCount} vagas abertas</p>
        </div>
        {company.website ? (
          <Link href={company.website} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-1 h-4 w-4" />
              Visitar site
            </Button>
          </Link>
        ) : null}
      </div>
    </CardContent>
  </Card>
);
