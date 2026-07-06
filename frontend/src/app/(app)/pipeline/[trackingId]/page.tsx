"use client";

import { useParams } from "next/navigation";

import { ProcessDetailPage } from "@/features/process-detail/components/ProcessDetailPage";

export default function ProcessDetailRoutePage() {
  const { trackingId } = useParams<{ trackingId: string }>();

  if (!trackingId) {
    return <p className="py-12 text-center text-muted-foreground">Processo inválido.</p>;
  }

  return <ProcessDetailPage trackingId={trackingId} />;
}
