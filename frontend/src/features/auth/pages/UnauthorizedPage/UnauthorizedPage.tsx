"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";

export const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <EmptyState
      icon={ShieldAlert}
      title="Acesso não autorizado"
      description="Você não possui permissão para acessar esta página."
      action={<Button onClick={() => router.push("/dashboard")}>Voltar ao início</Button>}
    />
  );
};
