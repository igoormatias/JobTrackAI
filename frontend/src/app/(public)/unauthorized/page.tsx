import { UnauthorizedPage } from "@/features/auth/pages/UnauthorizedPage";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function UnauthorizedRoutePage() {
  return (
    <PublicLayout>
      <UnauthorizedPage />
    </PublicLayout>
  );
}
