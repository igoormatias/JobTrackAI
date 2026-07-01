import { Breadcrumb } from "@/components/navigation/Breadcrumb";

export type JobDetailsBreadcrumbProps = {
  jobTitle: string;
};

export const JobDetailsBreadcrumb = ({ jobTitle }: JobDetailsBreadcrumbProps) => (
  <Breadcrumb
    items={[
      { label: "Vagas", href: "/jobs" },
      { label: jobTitle },
    ]}
  />
);
