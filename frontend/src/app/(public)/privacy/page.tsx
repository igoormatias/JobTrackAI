import type { Metadata } from "next";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { Heading, Muted } from "@/components/typography";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Política de Privacidade",
  description: "Como o JobTrack AI coleta, usa e protege seus dados pessoais.",
  path: "/privacy",
  noIndex: false,
});

export default function PrivacyPage() {
  return (
    <PublicLayout className="max-w-3xl py-12">
      <article className="space-y-6">
        <header className="space-y-2">
          <Heading level={1}>Política de Privacidade</Heading>
          <Muted>Última atualização: julho de 2026</Muted>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Coletamos dados necessários para operar o JobTrack AI: nome e e-mail via Google OAuth,
            preferências profissionais do onboarding e dados de uso da plataforma (vagas, pipeline,
            entrevistas).
          </p>
          <p>
            Se você conectar o Google Calendar, armazenamos tokens OAuth criptografados para
            sincronizar entrevistas. Não lemos e-mails nem acessamos dados além do escopo autorizado
            (<code className="text-foreground">calendar.events</code>).
          </p>
          <p>
            Utilizamos cookies de sessão para autenticação. Não vendemos dados pessoais. Você pode
            solicitar exclusão da conta e desconectar integrações a qualquer momento.
          </p>
          <p>
            Em conformidade com a LGPD, você pode solicitar acesso, correção ou exclusão dos seus
            dados pelo e-mail{" "}
            <a href="mailto:contato@jobtrack.ai" className="text-primary hover:underline">
              contato@jobtrack.ai
            </a>
            .
          </p>
        </section>
      </article>
    </PublicLayout>
  );
}
