export type CasaConceito =
  | "refugio_natural"
  | "casa_compartilhar"
  | "contemporaneo_autoral"
  | "vida_leve"
  | "bem_estar_essencial"
  | "casa_identidade";

export type CasaAnswerKey =
  | "tipoImovel"
  | "dor"
  | "sensacao"
  | "imagem"
  | "investimento"
  | "prazo";

export type CasaAnswers = Record<CasaAnswerKey, string>;

export type CasaResult = {
  conceito: CasaConceito;
  complementar: CasaConceito;
  hibrido: boolean;
  leadScore: number;
  leadClassificacao: "baixo" | "medio" | "alto" | "critico";
  indices: Record<string, number>;
};

export const conceitoMeta: Record<
  CasaConceito,
  {
    numero: number;
    titulo: string;
    subtitulo: string;
    imagem: string;
    cor: string;
    icone: string;
    significado: string;
    caracteristicas: string[];
    indices: Array<{ label: string; value: number }>;
    fechamento: string;
  }
> = {
  refugio_natural: {
    numero: 1,
    titulo: "Refúgio Natural",
    subtitulo: "Paz, biofilia e contemplação",
    imagem: "/casa-com-alma/refugio-natural.jpeg",
    cor: "text-primary",
    icone: "Leaf",
    significado:
      "Você acredita que uma casa deve ser um lugar para desacelerar. Valoriza o silêncio, a luz natural, o vento entrando pelas janelas, o verde ao redor e momentos de contemplação. Mais do que uma casa bonita, você procura um espaço que ajude a recuperar as energias e proporcione bem-estar todos os dias.",
    caracteristicas: [
      "Integração com jardins",
      "Grandes aberturas",
      "Iluminação natural abundante",
      "Madeira e materiais naturais",
      "Paisagismo como parte da arquitetura",
      "Ambientes leves e acolhedores",
    ],
    indices: [
      { label: "Natureza", value: 96 },
      { label: "Luz", value: 88 },
      { label: "Bem-estar", value: 92 },
      { label: "Personalidade", value: 74 },
    ],
    fechamento:
      "A sua casa tem potencial para se tornar um lugar onde o tempo desacelera e a natureza faz parte da sua rotina. Estou curiosa para descobrir como podemos construir isso juntos.",
  },
  casa_compartilhar: {
    numero: 2,
    titulo: "Casa para Compartilhar",
    subtitulo: "Família, encontros e integração",
    imagem: "/casa-com-alma/casa-compartilhar.jpeg",
    cor: "text-amber-800",
    icone: "Users",
    significado:
      "Para você, uma casa ganha vida quando está cheia de pessoas. Você imagina almoços de domingo, aniversários, amigos reunidos, crianças brincando e momentos que ficam na memória. A arquitetura precisa facilitar esses encontros.",
    caracteristicas: [
      "Sala integrada",
      "Cozinha aberta",
      "Área gourmet",
      "Jardim para receber",
      "Espaços amplos",
      "Integração entre interior e exterior",
    ],
    indices: [
      { label: "Convivência", value: 95 },
      { label: "Integração", value: 93 },
      { label: "Natureza", value: 82 },
      { label: "Personalidade", value: 75 },
    ],
    fechamento:
      "Os melhores projetos não são aqueles que impressionam à primeira vista, mas aqueles que se tornam palco das melhores lembranças. Acredito que a sua casa pode ser exatamente esse lugar.",
  },
  contemporaneo_autoral: {
    numero: 3,
    titulo: "Contemporâneo Autoral",
    subtitulo: "Design, sofisticação e exclusividade",
    imagem: "/casa-com-alma/contemporaneo-autoral.jpeg",
    cor: "text-stone-700",
    icone: "Gem",
    significado:
      "Você gosta de ambientes elegantes, mas não abre mão da personalidade. Busca um projeto exclusivo, sofisticado e atemporal, onde cada detalhe tenha um propósito. Seu lar deve refletir quem você é, sem seguir tendências apenas por estética.",
    caracteristicas: [
      "Linhas limpas",
      "Materiais nobres",
      "Iluminação cênica",
      "Marcenaria personalizada",
      "Design atemporal",
      "Acabamentos cuidadosamente escolhidos",
    ],
    indices: [
      { label: "Sofisticação", value: 96 },
      { label: "Materiais", value: 89 },
      { label: "Identidade", value: 94 },
      { label: "Natureza", value: 70 },
    ],
    fechamento:
      "Seu resultado mostra que você valoriza autenticidade. Mais do que seguir tendências, o seu projeto deve refletir quem você é e permanecer atual por muitos anos.",
  },
  vida_leve: {
    numero: 4,
    titulo: "Vida Leve",
    subtitulo: "Liberdade, ventilação e frescor",
    imagem: "/casa-com-alma/vida-leve.jpeg",
    cor: "text-sky-800",
    icone: "Waves",
    significado:
      "Você procura leveza. Gosta de ambientes iluminados, ventilados, integrados e conectados ao clima natural. Sua casa ideal transmite a sensação de férias, tranquilidade e liberdade.",
    caracteristicas: [
      "Grandes esquadrias",
      "Integração com varanda",
      "Tons claros",
      "Muito verde",
      "Ventilação cruzada",
      "Materiais naturais",
    ],
    indices: [
      { label: "Leveza", value: 97 },
      { label: "Luz", value: 91 },
      { label: "Natureza", value: 89 },
      { label: "Bem-estar", value: 85 },
    ],
    fechamento:
      "Você valoriza liberdade, luz e conexão com o que é essencial. Sua casa tem tudo para ser leve, aberta e inspiradora todos os dias.",
  },
  bem_estar_essencial: {
    numero: 5,
    titulo: "Bem-Estar Essencial",
    subtitulo: "Conforto, função e rotina",
    imagem: "/casa-com-alma/bem-estar-essencial.jpeg",
    cor: "text-yellow-800",
    icone: "Flower2",
    significado:
      "Você acredita que uma casa deve facilitar a rotina. Conforto, funcionalidade, organização e qualidade de vida são prioridades. Cada ambiente precisa fazer sentido para o seu dia a dia.",
    caracteristicas: [
      "Layout inteligente",
      "Ergonomia",
      "Organização",
      "Conforto térmico",
      "Iluminação funcional",
      "Espaços práticos",
    ],
    indices: [
      { label: "Conforto", value: 96 },
      { label: "Funcionalidade", value: 95 },
      { label: "Luz", value: 84 },
      { label: "Natureza", value: 73 },
    ],
    fechamento:
      "Seu resultado mostra que você busca equilíbrio e praticidade. Vamos transformar sua casa em um espaço que simplifica, acolhe e melhora sua qualidade de vida.",
  },
  casa_identidade: {
    numero: 6,
    titulo: "Casa com Identidade",
    subtitulo: "Personalidade, memória e história",
    imagem: "/casa-com-alma/casa-identidade.jpeg",
    cor: "text-rose-900",
    icone: "Star",
    significado:
      "Você não procura uma casa igual às outras. Quer um espaço que conte a sua história, represente sua personalidade e seja construído a partir das suas memórias, valores e estilo de vida. Para você, arquitetura é expressão.",
    caracteristicas: [
      "Projeto exclusivo",
      "Obras de arte",
      "Objetos afetivos",
      "Materiais com significado",
      "Ambientes únicos",
      "Design autoral",
    ],
    indices: [
      { label: "Identidade", value: 98 },
      { label: "Personalidade", value: 97 },
      { label: "Exclusividade", value: 95 },
      { label: "Natureza", value: 72 },
    ],
    fechamento:
      "Você tem clareza sobre quem é e sobre o que quer viver. Sua casa pode e deve ser uma extensão da sua essência. Estou ansiosa para criar algo verdadeiramente único para você.",
  },
};

export const casaQuestions: Array<{
  id: CasaAnswerKey;
  title: string;
  options: string[];
}> = [
  {
    id: "tipoImovel",
    title: "Qual é o tipo do seu imóvel?",
    options: ["Casa", "Apartamento", "Casa de praia", "Casa de campo", "Comercial", "Ainda não sei"],
  },
  {
    id: "dor",
    title: "O que mais incomoda hoje na sua casa?",
    options: [
      "Falta de iluminação",
      "Pouca integração",
      "Não representa minha personalidade",
      "Pouco contato com natureza",
      "Falta funcionalidade",
    ],
  },
  {
    id: "sensacao",
    title: "Como você deseja se sentir em casa?",
    options: ["Paz", "Aconchego", "Liberdade", "Sofisticação", "Leveza", "Energia"],
  },
  {
    id: "imagem",
    title: "Qual imagem traduz melhor a casa que você deseja viver?",
    options: Object.keys(conceitoMeta),
  },
  {
    id: "investimento",
    title: "Qual investimento você imagina para transformar sua casa?",
    options: ["Até R$ 80 mil", "R$ 80 a 150 mil", "Acima de R$ 150 mil", "Ainda não sei"],
  },
  {
    id: "prazo",
    title: "Quando você deseja iniciar?",
    options: ["Agora", "Até 3 meses", "3 a 6 meses", "Sem prazo definido"],
  },
];

const conceptScores: Record<CasaConceito, number> = {
  refugio_natural: 0,
  casa_compartilhar: 0,
  contemporaneo_autoral: 0,
  vida_leve: 0,
  bem_estar_essencial: 0,
  casa_identidade: 0,
};

function addScore(
  scores: Record<CasaConceito, number>,
  values: Partial<Record<CasaConceito, number>>,
) {
  for (const [key, value] of Object.entries(values)) {
    scores[key as CasaConceito] += value ?? 0;
  }
}

export function calculateCasaResult(answers: Partial<CasaAnswers>): CasaResult {
  const scores = { ...conceptScores };

  if (answers.dor === "Falta de iluminação") {
    addScore(scores, { refugio_natural: 2, vida_leve: 2, bem_estar_essencial: 1 });
  }
  if (answers.dor === "Pouca integração") {
    addScore(scores, { casa_compartilhar: 3, bem_estar_essencial: 1 });
  }
  if (answers.dor === "Não representa minha personalidade") {
    addScore(scores, { casa_identidade: 3, contemporaneo_autoral: 2 });
  }
  if (answers.dor === "Pouco contato com natureza") {
    addScore(scores, { refugio_natural: 3, vida_leve: 2 });
  }
  if (answers.dor === "Falta funcionalidade") {
    addScore(scores, { bem_estar_essencial: 3, casa_compartilhar: 1 });
  }

  if (answers.sensacao === "Paz") {
    addScore(scores, { refugio_natural: 3, bem_estar_essencial: 2 });
  }
  if (answers.sensacao === "Aconchego") {
    addScore(scores, { bem_estar_essencial: 3, casa_compartilhar: 1 });
  }
  if (answers.sensacao === "Liberdade") {
    addScore(scores, { vida_leve: 3, refugio_natural: 1 });
  }
  if (answers.sensacao === "Sofisticação") {
    addScore(scores, { contemporaneo_autoral: 3, casa_identidade: 1 });
  }
  if (answers.sensacao === "Leveza") {
    addScore(scores, { vida_leve: 3, refugio_natural: 2 });
  }
  if (answers.sensacao === "Energia") {
    addScore(scores, { casa_compartilhar: 3, vida_leve: 1 });
  }

  if (answers.imagem && answers.imagem in scores) {
    addScore(scores, { [answers.imagem]: 5 } as Partial<Record<CasaConceito, number>>);
  }

  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]) as Array<
    [CasaConceito, number]
  >;
  const conceito = ordered[0][0];
  const complementar = ordered[1][0];

  let leadScore = 0;
  if (answers.investimento === "Acima de R$ 150 mil") leadScore += 40;
  if (answers.investimento === "R$ 80 a 150 mil") leadScore += 30;
  if (answers.prazo === "Agora") leadScore += 30;
  if (answers.prazo === "Até 3 meses") leadScore += 20;
  if (answers.tipoImovel === "Casa") leadScore += 10;

  const leadClassificacao =
    leadScore >= 70 ? "alto" : leadScore >= 40 ? "medio" : "baixo";

  return {
    conceito,
    complementar,
    hibrido: ordered[0][1] - ordered[1][1] < 5,
    leadScore,
    leadClassificacao,
    indices: Object.fromEntries(conceitoMeta[conceito].indices.map((item) => [item.label, item.value])),
  };
}
