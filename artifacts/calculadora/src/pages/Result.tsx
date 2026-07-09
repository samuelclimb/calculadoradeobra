import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AlertOctagon, ArrowLeft, CheckCircle2, AlertTriangle, Info, Leaf } from "lucide-react";
import type { Lead } from "@workspace/api-client-react";

export default function Result() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<Lead | null>(null);

  useEffect(() => {
    // Read result from local storage
    const stored = localStorage.getItem("calculadoraResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse result", e);
      }
    } else {
      // If no result found, redirect back
      setLocation("/");
    }
  }, [setLocation]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-3 font-medium tracking-widest text-muted-foreground uppercase text-sm">
          Carregando diagnóstico...
        </div>
      </div>
    );
  }

  // Determine styles and icons based on classification — earthy, muted tones
  let riskColor = "";
  let riskBgColor = "";
  let riskLabel = "";
  let RiskIcon = Info;
  let riskMessage = "";

  switch (result.classificacao) {
    case "baixo":
      riskColor = "text-primary";
      riskBgColor = "bg-primary/5 border-primary/20";
      riskLabel = "Risco Baixo";
      RiskIcon = CheckCircle2;
      riskMessage = "Sua obra parece estar em uma fase controlada. Vale revisar escopo e orçamento antes de avançar.";
      break;
    case "medio":
      riskColor = "text-amber-700";
      riskBgColor = "bg-amber-50 border-amber-200";
      riskLabel = "Risco Médio";
      RiskIcon = AlertTriangle;
      riskMessage = "Sua obra tem pontos de atenção. Algumas decisões ainda estão abertas e isso pode gerar custo extra na execução.";
      break;
    case "alto":
      riskColor = "text-accent";
      riskBgColor = "bg-accent/10 border-accent/30";
      riskLabel = "Risco Alto";
      RiskIcon = AlertTriangle;
      riskMessage = "Sua obra pode ter custo invisível relevante. O risco está em começar sem projeto, sem orçamento detalhado ou sem decisões bem definidas.";
      break;
    case "critico":
      riskColor = "text-destructive";
      riskBgColor = "bg-destructive/10 border-destructive/30";
      riskLabel = "Risco Crítico";
      RiskIcon = AlertOctagon;
      riskMessage = "Sua obra já pode estar em uma fase onde corrigir erros sai caro. É urgente revisar escopo, projeto, orçamento e execução.";
      break;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif font-semibold tracking-tight text-primary hover:opacity-80">
            <Leaf className="h-5 w-5" strokeWidth={1.5} />
            <span>Diagnóstico de Obra</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 md:py-20 px-6">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              <Leaf className="h-4 w-4" strokeWidth={1.5} />
              Diagnóstico concluído
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">
              Olá, {result.nome.split(' ')[0]}
            </h1>
            <p className="text-lg text-muted-foreground">
              Aqui está o diagnóstico financeiro da sua obra.
            </p>
          </div>

          <div className={`rounded-3xl p-8 md:p-12 border ${riskBgColor} relative overflow-hidden mb-8`}>
            {/* Background texture icon */}
            <RiskIcon className={`absolute -right-8 -bottom-8 h-56 w-56 opacity-[0.06] ${riskColor}`} strokeWidth={1} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <RiskIcon className={`h-7 w-7 ${riskColor}`} strokeWidth={1.5} />
                <h2 className={`font-serif text-2xl font-semibold uppercase tracking-wide ${riskColor}`}>
                  {riskLabel}
                </h2>
              </div>

              <p className="text-lg leading-relaxed text-foreground">
                {riskMessage}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="p-6 rounded-2xl bg-muted/60 border border-border flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">O que isso significa?</span>
              <p className="text-sm leading-relaxed text-foreground/90">
                A combinação de fase da obra ("{result.fase}") com o seu nível de planejamento atual ("{result.projeto}" e "{result.orcamento}") indica o quão vulnerável você está aos custos invisíveis.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/60 border border-border flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Próximo passo</span>
              <p className="text-sm leading-relaxed text-foreground/90">
                O maior antídoto contra o custo invisível é congelar as decisões antes da obra começar. Não mude de ideia com o pedreiro na obra.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="w-full border-t border-border"></div>
            <p className="text-center text-muted-foreground max-w-lg mb-2">
              Guarde este diagnóstico como referência para revisar escopo, orçamento e decisões antes de avançar.
            </p>

            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 flex items-center gap-2 mt-2">
              <ArrowLeft className="h-4 w-4" />
              Refazer diagnóstico
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
