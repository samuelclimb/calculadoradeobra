import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Leaf, Loader2 } from "lucide-react";
import { useCreateLead, type LeadInput } from "@workspace/api-client-react";

type Question = {
  id: string;
  title: string;
  options: string[];
};

const questions: Question[] = [
  {
    id: "tipoObra",
    title: "Qual o tipo da sua obra?",
    options: ["Reforma de apartamento", "Reforma de casa", "Construção do zero", "Comercial", "Interiores", "Ainda não sei"]
  },
  {
    id: "tamanho",
    title: "Qual o tamanho aproximado?",
    options: ["Até 50 m²", "50 a 100 m²", "100 a 200 m²", "Acima de 200 m²", "Ainda não sei"]
  },
  {
    id: "fase",
    title: "Em qual fase você está?",
    options: ["Só pesquisando", "Tenho ideias", "Já falei com pedreiro", "Já tenho orçamento", "Quero começar em breve", "A obra já começou"]
  },
  {
    id: "projeto",
    title: "Sobre o projeto arquitetônico:",
    options: ["Não tenho", "Tenho referências", "Tenho planta simples", "Tenho projeto 3D", "Tenho projeto completo", "Não sei a diferença"]
  },
  {
    id: "orcamento",
    title: "Como está o seu planejamento financeiro (orçamento)?",
    options: ["Não tenho", "Estimativa informal", "Orçamento detalhado"]
  },
  {
    id: "medo",
    title: "Qual é o seu maior medo em relação à obra?",
    options: ["Estourar o orçamento", "Atrasar a obra", "Comprar material errado", "Ter retrabalho", "Não gostar do resultado", "Não saber por onde começar"]
  },
  {
    id: "prazo",
    title: "Quando você pretende começar a obra?",
    options: ["Agora", "Em até 30 dias", "1 a 3 meses", "3 a 6 meses", "Sem prazo definido", "Já comecei"]
  },
  {
    id: "investimento",
    title: "Qual o investimento previsto para a execução?",
    options: ["Até R$ 30 mil", "R$ 30 a 80 mil", "R$ 80 a 150 mil", "R$ 150 a 300 mil", "Acima de R$ 300 mil", "Ainda não sei"]
  }
];

function classifyRisk(data: LeadInput): "baixo" | "medio" | "alto" | "critico" {
  if (data.fase === "A obra já começou" || data.prazo === "Já comecei") {
    return "critico";
  }

  let score = 0;

  if (data.projeto === "Não tenho" || data.projeto === "Não sei a diferença") score += 3;
  else if (data.projeto === "Tenho referências" || data.projeto === "Tenho planta simples") score += 2;
  else if (data.projeto === "Tenho projeto 3D") score += 1;

  if (data.orcamento === "Não tenho") score += 2;
  else if (data.orcamento === "Estimativa informal") score += 1;

  if (data.prazo === "Agora" || data.prazo === "Em até 30 dias") score += 2;
  else if (data.prazo === "1 a 3 meses") score += 1;

  if (data.investimento === "Acima de R$ 300 mil" || data.investimento === "R$ 150 a 300 mil") score += 2;
  else if (data.investimento === "R$ 80 a 150 mil") score += 1;

  if (data.medo === "Ter retrabalho" || data.medo === "Estourar o orçamento" || data.medo === "Atrasar a obra") score += 1;

  if (score >= 7) return "alto";
  if (score >= 4) return "medio";
  return "baixo";
}

export default function Calculator() {
  const [, setLocation] = useLocation();
  const createLead = useCreateLead();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Form state for final step
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const totalSteps = questions.length + 1; // +1 for the personal data step
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleOptionSelect = (option: string) => {
    const question = questions[currentStep];
    setAnswers(prev => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setLocation("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !cidade) return;

    const leadInput: LeadInput = {
      nome,
      email,
      cidade,
      whatsapp: whatsapp || undefined,
      tipoObra: answers.tipoObra,
      tamanho: answers.tamanho,
      fase: answers.fase,
      projeto: answers.projeto,
      orcamento: answers.orcamento,
      medo: answers.medo,
      prazo: answers.prazo,
      investimento: answers.investimento
    };

    createLead.mutate({
      data: leadInput
    }, {
      onSuccess: (lead) => {
        // Store result in localStorage to read on the result page
        localStorage.setItem("calculadoraResult", JSON.stringify(lead));
        setLocation("/resultado");
      },
      onError: () => {
        const localLead = {
          id: Date.now(),
          ...leadInput,
          whatsapp: leadInput.whatsapp ?? null,
          classificacao: classifyRisk(leadInput),
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("calculadoraResult", JSON.stringify(localLead));
        setLocation("/resultado");
      }
    });
  };

  const isFinalStep = currentStep === questions.length;
  const isSubmitting = createLead.isPending;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      {/* Progress Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur z-10 border-b border-border">
        <div className="h-1 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="text-xs font-semibold tracking-widest text-primary uppercase flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5" strokeWidth={1.5} />
            Passo {currentStep + 1} de {totalSteps}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-24 pb-12 px-6 container mx-auto max-w-3xl justify-center min-h-[calc(100dvh-6rem)]">
        {!isFinalStep ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl mx-auto flex flex-col gap-10">
            <div className="flex items-start gap-4">
              <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif text-sm font-semibold shrink-0 mt-1">
                {currentStep + 1}
              </div>
              <h2 className="font-serif text-2xl md:text-4xl font-semibold tracking-tight leading-tight">
                {questions[currentStep].title}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {questions[currentStep].options.map((option) => {
                const isSelected = answers[questions[currentStep].id] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`
                      text-left px-6 py-5 rounded-2xl border text-base md:text-lg font-medium transition-all group relative overflow-hidden bg-card
                      ${isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-card-border hover:border-primary/40 hover:bg-muted/60'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <span>{option}</span>
                      {isSelected
                        ? <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        : <div className="h-5 w-5 rounded-full border border-border group-hover:border-primary/40" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={handleBack}
                className="px-6 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={!answers[questions[currentStep].id]}
                className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próximo
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-xl mx-auto flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-widest uppercase mb-3">
                <Leaf className="h-4 w-4" strokeWidth={1.5} />
                Última etapa
              </div>
              <h2 className="font-serif text-2xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
                Para onde enviamos seu diagnóstico?
              </h2>
              <p className="text-lg text-muted-foreground">
                Suas respostas nos ajudam a entender a essência e o potencial financeiro da sua obra.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-4 bg-card rounded-2xl p-6 md:p-8 border border-card-border">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome completo *</label>
                  <input
                    id="nome"
                    required
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail *</label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <label htmlFor="cidade" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cidade / Estado *</label>
                  <input
                    id="cidade"
                    required
                    type="text"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                    placeholder="São Paulo, SP"
                  />
                </div>

                <div className="space-y-2 pt-4">
                  <label htmlFor="whatsapp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                    <span>WhatsApp</span>
                    <span className="text-muted-foreground/60 font-normal lowercase tracking-normal">Opcional</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {createLead.isError && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                  Ocorreu um erro ao processar seu diagnóstico. Tente novamente.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !nome || !email || !cidade}
                className="w-full bg-primary text-primary-foreground rounded-full py-5 text-lg font-medium flex items-center justify-center gap-3 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Calculando risco...
                  </>
                ) : (
                  <>
                    Ver meu diagnóstico
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
