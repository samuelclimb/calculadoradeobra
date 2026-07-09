import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertOctagon,
  ArrowLeft,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  Leaf,
  Ruler,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Lead } from "@workspace/api-client-react";

type RiskConfig = {
  color: string;
  bg: string;
  label: string;
  title: string;
  message: string;
  revelation: string;
  decision: string;
  icon: typeof Info;
};

const riskConfig: Record<string, RiskConfig> = {
  baixo: {
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
    label: "Risco Baixo",
    title: "Sua obra está em uma fase mais controlada",
    message:
      "O seu planejamento já mostra sinais de organização. Ainda assim, pequenas decisões abertas podem virar custos extras se não forem registradas antes da execução.",
    revelation:
      "Seu diagnóstico indica uma base mais segura para avançar. O ponto principal agora é transformar decisões que parecem resolvidas em informações claras: escopo, materiais, orçamento e sequência de execução.",
    decision:
      "Antes de avançar, revise se o orçamento cobre todos os ambientes, acabamentos e etapas. Uma obra controlada continua controlada quando cada escolha importante está documentada.",
    icon: CheckCircle2,
  },
  medio: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Risco Médio",
    title: "Existem decisões que ainda precisam ganhar clareza",
    message:
      "Sua obra tem uma boa direção, mas alguns pontos ainda podem estar soltos. É nessa faixa que o custo invisível costuma aparecer aos poucos, em ajustes, compras extras e mudanças de escopo.",
    revelation:
      "O resultado mostra que você já saiu do zero, mas ainda precisa organizar melhor a ligação entre projeto, orçamento e execução. Quando essas três partes não conversam, o valor final tende a se afastar da expectativa inicial.",
    decision:
      "Escolha uma frente para organizar primeiro: detalhar orçamento, revisar projeto, fechar materiais ou alinhar cronograma. Resolver uma dessas camadas já reduz bastante a chance de surpresas.",
    icon: AlertTriangle,
  },
  alto: {
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30",
    label: "Risco Alto",
    title: "Custos importantes podem estar fora do radar",
    message:
      "O seu cenário pede atenção antes de avançar. Quando projeto, orçamento ou prazo ainda não estão suficientemente fechados, a obra pode parecer viável no início e ficar mais cara no caminho.",
    revelation:
      "Seu diagnóstico aponta risco de decisões relevantes serem tomadas durante a execução. Isso aumenta a chance de retrabalho, compras duplicadas, incompatibilidades e escolhas feitas sob pressão.",
    decision:
      "Antes de contratar ou iniciar novas etapas, transforme o planejamento em uma lista objetiva: o que será feito, com quais materiais, em qual ordem e com qual limite de investimento.",
    icon: AlertTriangle,
  },
  critico: {
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    label: "Risco Crítico",
    title: "Sua obra precisa de uma pausa estratégica",
    message:
      "O diagnóstico indica que decisões de alto impacto podem estar acontecendo tarde demais. Nesse estágio, corrigir rota costuma custar mais do que organizar antes de continuar.",
    revelation:
      "Quando a obra já está em movimento ou prestes a começar sem clareza total, cada mudança afeta prazo, compra de materiais, mão de obra e acabamento. O risco não está apenas no valor, mas na soma de pequenas correções.",
    decision:
      "Faça uma revisão curta e firme antes do próximo passo: escopo fechado, orçamento por etapa, lista de materiais e prioridades. Isso ajuda a recuperar controle sem travar a obra inteira.",
    icon: AlertOctagon,
  },
};

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

  const config = riskConfig[result.classificacao] ?? riskConfig.baixo;
  const RiskIcon = config.icon;
  const attentionPoints = getAttentionPoints(result);
  const actionSteps = getActionSteps(result);

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
        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              <Leaf className="h-4 w-4" strokeWidth={1.5} />
              Diagnóstico concluído
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">
              Olá, {result.nome.split(' ')[0]}
            </h1>
            <p className="text-lg text-muted-foreground">
              Aqui está uma leitura clara dos pontos que podem gerar custo invisível na sua obra.
            </p>
          </div>

          <section className={`rounded-3xl p-8 md:p-12 border ${config.bg} relative overflow-hidden mb-6`}>
            <RiskIcon className={`absolute -right-8 -bottom-8 h-56 w-56 opacity-[0.06] ${config.color}`} strokeWidth={1} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <RiskIcon className={`h-7 w-7 ${config.color}`} strokeWidth={1.5} />
                <span className={`text-xs font-semibold uppercase tracking-widest ${config.color}`}>
                  {config.label}
                </span>
              </div>

              <h2 className="max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                {config.title}
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/90">
                {config.message}
              </p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-card-border bg-card p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                O que seu diagnóstico revela
              </div>
              <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
                {config.revelation}
              </p>
            </div>

            <div className="rounded-2xl border border-card-border bg-card p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                Próxima decisão
              </div>
              <p className="text-base leading-relaxed text-foreground/90">
                {config.decision}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <DiagnosticPanel
              eyebrow="Pontos de atenção"
              title="Onde o custo invisível pode aparecer"
              items={attentionPoints}
            />
            <DiagnosticPanel
              eyebrow="Como reduzir o risco"
              title="Ações práticas antes de avançar"
              items={actionSteps}
            />
          </section>

          <section className="mt-6 rounded-2xl border border-primary/15 bg-primary p-7 text-primary-foreground md:p-8">
            <p className="font-serif text-2xl font-semibold leading-tight">
              Use este diagnóstico como uma pausa inteligente.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/80">
              Antes de contratar, comprar ou iniciar a próxima etapa, revise o que ainda não está claro. Quanto mais
              objetivo for o plano, menor a chance de pequenos detalhes virarem gasto extra.
            </p>
          </section>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="w-full border-t border-border"></div>
            <p className="text-center text-muted-foreground max-w-lg mb-2">
              Guarde esta análise como referência para comparar orçamento, projeto e decisões antes das próximas etapas.
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

function DiagnosticPanel({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ icon: typeof Info; title: string; text: string }>;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-6 md:p-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h3 className="mb-5 font-serif text-2xl font-semibold leading-tight">{title}</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAttentionPoints(result: Lead) {
  const points: Array<{ icon: typeof Info; title: string; text: string }> = [];

  if (result.orcamento === "Não tenho" || result.orcamento === "Estimativa informal") {
    points.push({
      icon: Wallet,
      title: "Orçamento ainda precisa de detalhamento",
      text: "Uma estimativa geral ajuda a começar, mas não mostra onde o dinheiro será consumido. O ideal é separar valores por ambiente, etapa e tipo de acabamento.",
    });
  }

  if (result.projeto === "Não tenho" || result.projeto === "Tenho referências" || result.projeto === "Tenho planta simples" || result.projeto === "Não sei a diferença") {
    points.push({
      icon: FileText,
      title: "Projeto precisa orientar a execução",
      text: "Referências e ideias são importantes, mas a obra precisa de informação suficiente para guiar compras, medidas, acabamentos e mão de obra.",
    });
  } else if (result.projeto === "Tenho projeto 3D") {
    points.push({
      icon: Ruler,
      title: "O 3D precisa conversar com orçamento e execução",
      text: "A imagem do projeto ajuda a visualizar o resultado, mas o custo invisível aparece quando materiais, medidas e soluções técnicas não estão detalhados.",
    });
  }

  if (result.prazo === "Agora" || result.prazo === "Em até 30 dias" || result.prazo === "Já comecei") {
    points.push({
      icon: CalendarClock,
      title: "Prazo curto reduz margem de decisão",
      text: "Quanto menos tempo existe antes da execução, maior a chance de escolhas rápidas virarem compras extras, trocas ou adaptações.",
    });
  }

  if (result.fase === "A obra já começou") {
    points.push({
      icon: AlertOctagon,
      title: "A obra em andamento pede controle de mudanças",
      text: "Nesta fase, qualquer alteração precisa ser avaliada antes de executar para não gerar retrabalho, atraso ou desperdício de material.",
    });
  }

  if (points.length < 3) {
    points.push({
      icon: ClipboardList,
      title: "Escopo precisa ficar visível",
      text: "Liste exatamente o que entra e o que fica fora da obra. Isso evita que decisões pequenas sejam tratadas como detalhe e apareçam depois no custo final.",
    });
  }

  return points.slice(0, 3);
}

function getActionSteps(result: Lead) {
  const steps: Array<{ icon: typeof Info; title: string; text: string }> = [
    {
      icon: ClipboardList,
      title: "Feche o escopo por etapas",
      text: "Separe demolição, infraestrutura, revestimentos, marcenaria, iluminação, pintura e acabamentos. Assim fica mais fácil enxergar o que falta.",
    },
    {
      icon: Wallet,
      title: "Compare orçamento por item",
      text: "Não olhe apenas o valor final. Compare quantidades, marcas, prazos, mão de obra inclusa e o que ficou fora da proposta.",
    },
  ];

  if (result.investimento === "Ainda não sei") {
    steps.push({
      icon: ShieldCheck,
      title: "Defina um teto de investimento",
      text: "Mesmo que seja uma faixa inicial, um limite ajuda a orientar escolhas de material, fornecedores e prioridades.",
    });
  } else {
    steps.push({
      icon: ShieldCheck,
      title: "Reserve uma margem de segurança",
      text: "Toda obra precisa de uma reserva para ajustes inevitáveis. A diferença é decidir essa margem antes, não quando o problema aparece.",
    });
  }

  return steps;
}
