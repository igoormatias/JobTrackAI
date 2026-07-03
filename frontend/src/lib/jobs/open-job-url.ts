import { toast } from "sonner";

export type OpenJobUrlOptions = {
  sourceUrl?: string | null;
  status?: string;
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const openJobUrl = ({ sourceUrl, status }: OpenJobUrlOptions): boolean => {
  if (status && status !== "active") {
    toast.error("Vaga encerrada", {
      description: "Esta vaga não está mais disponível na plataforma de origem.",
    });
    return false;
  }

  const trimmed = sourceUrl?.trim();
  if (!trimmed || !isValidHttpUrl(trimmed)) {
    toast.error("Link indisponível", {
      description: "Não foi possível abrir a vaga. A URL original não está disponível.",
    });
    return false;
  }

  window.open(trimmed, "_blank", "noopener,noreferrer");
  return true;
};
