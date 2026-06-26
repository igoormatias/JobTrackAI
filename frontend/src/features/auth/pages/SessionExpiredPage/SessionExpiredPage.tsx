"use client";

import { useRouter } from "next/navigation";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";

export const SessionExpiredPage = () => {
  const router = useRouter();

  return (
    <EmptyState
      icon={Clock3}
      title="Sessão expirada"
      description="Sua sessão expirou. Entre novamente para continuar."
      action={<Button onClick={() => router.push("/login")}>Entrar novamente</Button>}
    />
  );
};
