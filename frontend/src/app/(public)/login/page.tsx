import { PublicLayout } from "@/components/layout/PublicLayout";
import { LoginPlaceholderPage } from "@/features/auth/pages/LoginPlaceholderPage";

export default function LoginPage() {
  return (
    <PublicLayout>
      <LoginPlaceholderPage />
    </PublicLayout>
  );
}
