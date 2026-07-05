import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Heading, Muted } from "@/components/typography";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Termos de Serviço",
  description: "Termos de uso do JobTrack AI — plataforma de gerenciamento de carreira.",
  path: "/terms",
  noIndex: false,
});

export default function TermsPage() {
  return (
    <PublicLayout className="max-w-3xl py-12">
      <article className="space-y-6">
        <header className="space-y-2">
          <Heading level={1}>Termos de Serviço</Heading>
          <Muted>Última atualização: julho de 2026</Muted>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            O JobTrack AI é uma plataforma de organização de carreira. Não realizamos candidaturas em
            nome do usuário — você continua aplicando nas plataformas de origem das vagas.
          </p>
          <p>
            Ao utilizar o serviço, você concorda em fornecer informações verdadeiras no onboarding e
            usar a plataforma de forma lícita. O acesso pode ser suspenso em caso de uso abusivo ou
            violação destes termos.
          </p>
          <p>
            Integrações opcionais (como Google Calendar) exigem consentimento explícito e podem ser
            revogadas a qualquer momento nas configurações da conta.
          </p>
          <p>
            O serviço é fornecido &quot;como está&quot;, sem garantias de disponibilidade contínua.
            Funcionalidades podem evoluir conforme o roadmap do produto.
          </p>
          <p>
            Dúvidas: <a href="mailto:contato@jobtrack.ai" className="text-primary hover:underline">contato@jobtrack.ai</a>
          </p>
        </section>
      </article>
    </PublicLayout>
  );
}
