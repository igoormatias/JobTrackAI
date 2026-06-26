import { Spinner } from "@/components/feedback/Spinner";
import { Muted } from "@/components/typography";

import { JobTrackLogo } from "../../components/JobTrackLogo";

export const LoadingSessionPage = () => (
  <div className="flex w-full max-w-md flex-col items-center gap-6 py-8">
    <JobTrackLogo showText={false} />
    <Spinner className="h-8 w-8 text-primary" />
    <Muted>Carregando sessão...</Muted>
  </div>
);
