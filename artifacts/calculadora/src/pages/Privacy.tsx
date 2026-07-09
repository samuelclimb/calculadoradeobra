import { Link } from "wouter";
import { ArrowLeft, Leaf } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-serif font-semibold tracking-tight text-primary">
            <Leaf className="h-5 w-5" strokeWidth={1.5} />
            <span>Política de Privacidade</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-10 md:py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <section className="space-y-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              LGPD
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-5xl">
              Política de Privacidade
            </h1>
            <p className="mt-4 text-muted-foreground">
              Esta página explica, de forma simples, como os dados informados nos diagnósticos são tratados.
            </p>
          </div>

          <PolicyBlock title="Dados coletados">
            Coletamos nome, e-mail, cidade/estado, WhatsApp quando informado, respostas selecionadas no diagnóstico,
            resultado gerado e data de envio.
          </PolicyBlock>

          <PolicyBlock title="Finalidade">
            Os dados são usados para gerar o resultado do diagnóstico, armazenar o histórico no painel administrativo e
            organizar internamente os diagnósticos enviados.
          </PolicyBlock>

          <PolicyBlock title="Base legal">
            O tratamento é realizado com base no consentimento fornecido pelo titular ao marcar o aceite antes do envio
            do formulário. O envio não acontece sem esse aceite.
          </PolicyBlock>

          <PolicyBlock title="Compartilhamento e armazenamento">
            Os dados ficam armazenados em serviços de infraestrutura necessários para o funcionamento do site, como
            hospedagem da aplicação e banco de dados. Não vendemos dados pessoais.
          </PolicyBlock>

          <PolicyBlock title="Retenção">
            Os dados são mantidos pelo tempo necessário para as finalidades acima ou até que o titular solicite a
            exclusão, quando aplicável.
          </PolicyBlock>

          <PolicyBlock title="Direitos do titular">
            Você pode solicitar confirmação de tratamento, acesso, correção, exclusão ou revogação do consentimento pelo
            canal oficial de atendimento do responsável pelo projeto.
          </PolicyBlock>

          <PolicyBlock title="Segurança">
            O painel administrativo é protegido por login e senha, e a aplicação utiliza conexão segura em HTTPS no
            ambiente publicado.
          </PolicyBlock>

          <PolicyBlock title="Cookies e armazenamento local">
            Este site não usa cookies próprios de rastreamento. O navegador pode guardar temporariamente o resultado do
            diagnóstico no armazenamento local apenas para exibir a tela de resultado depois do envio.
          </PolicyBlock>

          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            Última atualização: 09/07/2026.
          </p>
        </section>
      </main>
    </div>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-6">
      <h2 className="mb-3 font-serif text-xl font-semibold">{title}</h2>
      <p className="leading-relaxed text-foreground/85">{children}</p>
    </section>
  );
}
