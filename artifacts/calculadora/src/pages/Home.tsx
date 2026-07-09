import { Link } from "wouter";
import { ArrowRight, Leaf, FileWarning, ShieldAlert, Calculator, RefreshCcw } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-background selection:bg-primary/20">

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-semibold tracking-tight text-primary">
            <Leaf className="h-5 w-5" strokeWidth={1.5} />
            <span>Diagnóstico de Obra</span>
          </div>
        </div>
      </header>

      {/* Olive banner strip */}
      <div className="bg-primary text-primary-foreground text-center text-xs md:text-sm tracking-wide py-2 px-6">
        Suas respostas nos ajudam a entender o risco financeiro real da sua obra.
      </div>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 container mx-auto max-w-5xl grid md:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
          <div className="flex flex-col items-start gap-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold tracking-wide uppercase border border-accent/20">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Atenção ao risco financeiro
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight leading-[1.15] text-foreground">
              A falta de planejamento{" "}
              <span className="text-primary italic block">gera custos invisíveis.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Retrabalho, atrasos e compras erradas não aparecem no orçamento inicial.
              Descubra em 2 minutos qual o nível de risco da sua obra ou reforma antes de começar.
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4 text-primary" strokeWidth={1.5} />
              Leva apenas 2 minutos para preencher
            </div>

            <Link
              href="/calculadora"
              className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-full px-8 py-4 text-base md:text-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Iniciar diagnóstico gratuito
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-card-border shadow-lg aspect-[4/5] bg-muted">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
              alt="Ambiente residencial com integração natural"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
          </div>
        </section>

        {/* Risks Section */}
        <section className="bg-muted/60 py-20 px-6 border-y border-border">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <Leaf className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">O que ninguém conta antes da obra</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mb-12">
              Os 4 custos invisíveis típicos
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-card rounded-2xl p-8 border border-card-border hover:border-primary/40 transition-colors flex flex-col gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <FileWarning className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold">O custo do retrabalho</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Decisões tomadas com o pedreiro durante a execução frequentemente precisam ser desfeitas e refeitas. Você paga pelo material e pela mão de obra duas vezes.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-card-border hover:border-primary/40 transition-colors flex flex-col gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold">O custo do atraso</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Falta de cronograma ou projeto incompleto paralisa a equipe. Mão de obra parada continua custando, além do transtorno de não mudar.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-card-border hover:border-primary/40 transition-colors flex flex-col gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Calculator className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold">A compra errada</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprar material de acabamento sem especificar medidas gera sobras inúteis ou falta de lotes iguais no fornecedor.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-card-border hover:border-primary/40 transition-colors flex flex-col gap-4">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <RefreshCcw className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl font-semibold">O "já que"</h3>
                <p className="text-muted-foreground leading-relaxed">
                  "Já que estamos quebrando aqui, vamos fazer isso também." Sem um escopo fechado, o orçamento infla até fugir do controle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bottom */}
        <section className="py-24 px-6 container mx-auto max-w-3xl text-center flex flex-col items-center gap-8">
          <Leaf className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
            Você sabe quanto a sua obra vai custar de verdade?
          </h2>
          <Link
            href="/calculadora"
            className="inline-flex items-center justify-center gap-3 bg-foreground text-background rounded-full px-8 py-4 text-lg font-medium hover:bg-foreground/90 transition-colors"
          >
            Fazer diagnóstico de risco
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-6 bg-card text-muted-foreground text-sm text-center">
        <p>Diagnóstico Financeiro de Obras. Uma ferramenta de análise de risco.</p>
        <Link href="/admin" className="text-xs hover:text-foreground mt-4 inline-block underline underline-offset-4">Área Administrativa</Link>
      </footer>
    </div>
  );
}
