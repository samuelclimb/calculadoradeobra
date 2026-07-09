import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flower2,
  Gem,
  Leaf,
  Loader2,
  Star,
  Users,
  Waves,
} from "lucide-react";

import {
  calculateCasaResult,
  casaQuestions,
  conceitoMeta,
  type CasaAnswerKey,
  type CasaAnswers,
  type CasaConceito,
} from "@/features/casa-com-alma/data";

const iconMap = { Leaf, Users, Gem, Waves, Flower2, Star };

export default function CasaComAlma() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<CasaAnswers>>({});
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const totalSteps = casaQuestions.length + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const question = casaQuestions[currentStep];
  const isFinalStep = currentStep === casaQuestions.length;

  const selectAnswer = (id: CasaAnswerKey, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      return;
    }

    setLocation("/");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome || !email || !cidade) return;

    setIsSubmitting(true);
    setSubmitError(false);

    const result = calculateCasaResult(answers);
    const meta = conceitoMeta[result.conceito];
    const complementar = conceitoMeta[result.complementar];
    const payload = {
      nome,
      email,
      cidade,
      whatsapp: whatsapp || undefined,
      origem: "casa_com_alma",
      tipoObra: answers.tipoImovel ?? "Não informado",
      tamanho: "Diagnóstico Casa com Alma",
      fase: "Diagnóstico de conceito arquitetônico",
      projeto: answers.dor ?? "Não informado",
      orcamento: answers.sensacao ?? "Não informado",
      medo: answers.imagem ? conceitoMeta[answers.imagem as CasaConceito].titulo : "Não informado",
      prazo: answers.prazo ?? "Não informado",
      investimento: answers.investimento ?? "Não informado",
      classificacao: result.leadClassificacao,
      resultado: meta.titulo,
      resultadoComplementar: complementar.titulo,
      leadScore: result.leadScore,
      answers: {
        tipoImovel: answers.tipoImovel,
        dor: answers.dor,
        sensacao: answers.sensacao,
        imagem: answers.imagem ? conceitoMeta[answers.imagem as CasaConceito].titulo : undefined,
        investimento: answers.investimento,
        prazo: answers.prazo,
        hibrido: result.hibrido,
        indices: result.indices,
      },
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha ao salvar");

      const lead = await response.json();
      localStorage.setItem(
        "casaComAlmaResult",
        JSON.stringify({ ...lead, casaResult: result }),
      );
      setLocation("/casa-com-alma/resultado");
    } catch (error) {
      console.error(error);
      setSubmitError(true);
      localStorage.setItem(
        "casaComAlmaResult",
        JSON.stringify({
          id: Date.now(),
          ...payload,
          whatsapp: payload.whatsapp ?? null,
          createdAt: new Date().toISOString(),
          casaResult: result,
        }),
      );
      setLocation("/casa-com-alma/resultado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background selection:bg-primary/20">
      <header className="fixed inset-x-0 top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <button
            onClick={goBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Leaf className="h-3.5 w-3.5" strokeWidth={1.5} />
            Casa com Alma
          </div>
        </div>
      </header>

      <main className="container mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center px-6 pb-12 pt-24">
        {!isFinalStep ? (
          <section className="mx-auto flex w-full max-w-4xl animate-in flex-col gap-9 fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-sm font-semibold text-primary-foreground">
                {currentStep + 1}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Passo {currentStep + 1} de {totalSteps}
                </p>
                <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight md:text-4xl">
                  {question.title}
                </h1>
              </div>
            </div>

            {question.id === "imagem" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {question.options.map((option, index) => {
                  const concept = option as CasaConceito;
                  const meta = conceitoMeta[concept];
                  const selected = answers.imagem === option;
                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer("imagem", option)}
                      className={`group overflow-hidden rounded-2xl border bg-card text-left transition-all ${
                        selected ? "border-primary ring-2 ring-primary/20" : "border-card-border hover:border-primary/40"
                      }`}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={meta.imagem}
                          alt={`Imagem ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <span className="font-medium">Imagem {index + 1}</span>
                        {selected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        ) : (
                          <span className="h-5 w-5 rounded-full border border-border" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer(question.id, option)}
                      className={`rounded-2xl border bg-card px-6 py-5 text-left text-base font-medium transition-all md:text-lg ${
                        selected ? "border-primary bg-primary/5 text-primary" : "border-card-border hover:border-primary/40 hover:bg-muted/60"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-4">
                        {option}
                        {selected ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                        ) : (
                          <span className="h-5 w-5 shrink-0 rounded-full border border-border" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={goBack} className="px-6 py-4 font-medium text-muted-foreground hover:text-foreground">
                Anterior
              </button>
              <button
                onClick={() => setCurrentStep((step) => step + 1)}
                disabled={!answers[question.id]}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próximo
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-auto flex w-full max-w-xl animate-in flex-col gap-8 fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                <Leaf className="h-4 w-4" strokeWidth={1.5} />
                Última etapa
              </div>
              <h1 className="mb-4 font-serif text-2xl font-semibold leading-tight tracking-tight md:text-4xl">
                Para onde enviamos seu diagnóstico?
              </h1>
              <p className="text-lg text-muted-foreground">
                Suas respostas revelam o conceito arquitetônico que mais combina com a forma como você deseja viver.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6">
              <div className="space-y-4 rounded-2xl border border-card-border bg-card p-6 md:p-8">
                <TextField id="casa-nome" label="Nome completo *" value={nome} onChange={setNome} required />
                <TextField id="casa-email" label="E-mail *" value={email} onChange={setEmail} type="email" required />
                <TextField id="casa-cidade" label="Cidade / Estado *" value={cidade} onChange={setCidade} required />
                <TextField id="casa-whatsapp" label="WhatsApp" value={whatsapp} onChange={setWhatsapp} type="tel" />
              </div>

              {submitError && (
                <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-sm font-medium text-accent">
                  Seu resultado foi gerado. Se o salvamento falhar, tente reenviar depois pelo atendimento.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !nome || !email || !cidade}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-5 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Calculando conceito...
                  </>
                ) : (
                  <>
                    Ver meu resultado
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2 pt-2 first:pt-0">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
      />
    </div>
  );
}

export { iconMap };
