import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Flower2,
  Gem,
  Heart,
  Home,
  Leaf,
  Sparkles,
  Star,
  Sun,
  Users,
  Waves,
} from "lucide-react";

import {
  conceitoMeta,
  type CasaConceito,
  type CasaResult,
} from "@/features/casa-com-alma/data";

const iconMap = { Leaf, Users, Gem, Waves, Flower2, Star };
const indexIcons = [Leaf, Sun, Heart, Sparkles];

type StoredCasaResult = {
  nome: string;
  resultado?: string;
  resultadoComplementar?: string;
  casaResult?: CasaResult;
};

export default function CasaComAlmaResult() {
  const [, setLocation] = useLocation();
  const [stored, setStored] = useState<StoredCasaResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("casaComAlmaResult");
    if (!raw) {
      setLocation("/casa-com-alma");
      return;
    }

    try {
      setStored(JSON.parse(raw));
    } catch (error) {
      console.error(error);
      setLocation("/casa-com-alma");
    }
  }, [setLocation]);

  const concept = useMemo<CasaConceito>(() => {
    const fromResult = stored?.casaResult?.conceito;
    if (fromResult) return fromResult;

    const found = Object.entries(conceitoMeta).find(([, meta]) => meta.titulo === stored?.resultado);
    return (found?.[0] as CasaConceito | undefined) ?? "refugio_natural";
  }, [stored]);

  if (!stored) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="animate-pulse text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Carregando resultado...
        </p>
      </div>
    );
  }

  const meta = conceitoMeta[concept];
  const complementar =
    conceitoMeta[stored.casaResult?.complementar ?? "bem_estar_essencial"];
  const Icon = iconMap[meta.icone as keyof typeof iconMap];

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/casa-com-alma" className="flex items-center gap-2 font-serif font-semibold tracking-tight text-primary">
            <Leaf className="h-5 w-5" strokeWidth={1.5} />
            <span>Casa com Alma</span>
          </Link>
          <span className="hidden text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:block">
            Diagnóstico concluído
          </span>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-10 md:py-16">
        <section className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Seu resultado - Diagnóstico Casa com Alma
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            {stored.nome.split(" ")[0]}, seu conceito é {meta.titulo}
          </h1>
          {stored.casaResult?.hibrido && (
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Seu perfil também conversa com {complementar.titulo}, criando uma composição mais híbrida e personalizada.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[320px]">
              <img src={meta.imagem} alt={meta.titulo} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-sm font-semibold uppercase tracking-widest">Conceito {meta.numero}</span>
                </div>
                <h2 className="font-serif text-4xl font-semibold">{meta.titulo}</h2>
                <p className="mt-2 text-white/85">{meta.subtitulo}</p>
              </div>
            </div>

            <div className="flex flex-col gap-8 p-7 md:p-10">
              <div>
                <h3 className="mb-3 font-serif text-2xl font-semibold">O que isso significa?</h3>
                <p className="leading-relaxed text-foreground/90">{meta.significado}</p>
              </div>

              <div>
                <h3 className="mb-4 font-serif text-xl font-semibold">Sua casa ideal possui:</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {meta.caracteristicas.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Leaf className="h-3 w-3" strokeWidth={1.8} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-serif text-xl font-semibold">Seu Índice Casa com Alma</h3>
                <div className="space-y-3">
                  {meta.indices.map((item, index) => {
                    const IndexIcon = indexIcons[index % indexIcons.length];
                    return (
                      <div key={item.label} className="grid grid-cols-[120px_1fr_42px] items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <IndexIcon className="h-4 w-4" strokeWidth={1.5} />
                          {item.label}
                        </span>
                        <span className="h-2 overflow-hidden rounded-full bg-muted">
                          <span className="block h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                        </span>
                        <span className="text-right font-medium">{item.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-primary/15 bg-primary p-7 text-primary-foreground md:p-8">
          <div className="grid gap-6 md:items-center">
            <div>
              <p className="text-lg leading-relaxed">{meta.fechamento}</p>
              <p className="mt-3 text-sm text-primary-foreground/80">
                Guarde este conceito como referência para escolhas de layout, materiais, iluminação e atmosfera da sua casa.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 text-sm text-muted-foreground md:grid-cols-4">
          <MiniFeature icon={Leaf} label="Projetos autorais com propósito" />
          <MiniFeature icon={Sparkles} label="Conexão com a natureza" />
          <MiniFeature icon={Home} label="Arquitetura que acolhe e transforma" />
          <MiniFeature icon={Heart} label="Histórias que ganham forma" />
        </section>

        <div className="mt-10 flex justify-center">
          <Link href="/casa-com-alma" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Refazer diagnóstico
          </Link>
        </div>
      </main>
    </div>
  );
}

function MiniFeature({ icon: Icon, label }: { icon: typeof Leaf; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/70 p-4">
      <Icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
      <span>{label}</span>
    </div>
  );
}
