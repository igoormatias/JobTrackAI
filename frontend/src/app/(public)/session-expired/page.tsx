import { SessionExpiredPage } from "@/features/auth/pages/SessionExpiredPage";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function SessionExpiredRoutePage() {
  return (
    <PublicLayout>
      <SessionExpiredPage />
    </PublicLayout>
  );
}
