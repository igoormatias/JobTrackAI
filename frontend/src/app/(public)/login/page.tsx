import { LoginPage } from "@/features/auth/pages/LoginPage";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function LoginRoutePage() {
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}
