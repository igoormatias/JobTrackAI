import { Muted } from "@/components/typography";

export type JobDetailsEmptySectionProps = {
  message: string;
};

export const JobDetailsEmptySection = ({ message }: JobDetailsEmptySectionProps) => (
  <Muted className="text-sm">{message}</Muted>
);
