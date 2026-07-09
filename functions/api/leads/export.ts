import * as XLSX from "xlsx";

import {
  ensureLeadColumns,
  formatarClassificacao,
  getSql,
  normalizeLeadRows,
  unauthorized,
  verifyAdmin,
  type Env,
  type LeadRow,
} from "../../_lib/api";

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (!(await verifyAdmin(context.request, context.env))) {
    return unauthorized();
  }

  const sql = getSql(context.env);
  await ensureLeadColumns(sql);
  const rows = await sql`
    select
      id,
      nome,
      email,
      cidade,
      whatsapp,
      origem,
      tipo_obra as "tipoObra",
      tamanho,
      fase,
      projeto,
      orcamento,
      medo,
      prazo,
      investimento,
      classificacao,
      resultado,
      resultado_complementar as "resultadoComplementar",
      lead_score as "leadScore",
      answers,
      created_at as "createdAt"
    from leads
    order by created_at desc
  `;
  const leads = normalizeLeadRows(rows as LeadRow[]);

  const overviewRows = leads.map((lead) => ({
    ID: lead.id,
    Data: formatDate(lead.createdAt),
    Origem: getOrigemLabel(lead.origem),
    Nome: lead.nome,
    Email: lead.email,
    Cidade: lead.cidade,
    WhatsApp: lead.whatsapp ?? "",
    Resultado: formatarClassificacao(lead.classificacao),
    "Conceito principal": lead.resultado ?? "",
    "Conceito complementar": lead.resultadoComplementar ?? "",
    "Lead score": lead.leadScore ?? "",
    "Tipo de obra / imóvel": lead.tipoObra,
    Tamanho: lead.tamanho,
    Fase: lead.fase,
    Projeto: lead.projeto,
    "Orçamento / sensação": lead.orcamento,
    "Medo / imagem": lead.medo,
    Prazo: lead.prazo,
    Investimento: lead.investimento,
  }));

  const answerRows = leads.flatMap((lead) => {
    const answers = lead.answers ?? {};
    const entries = Object.entries(answers);

    if (entries.length === 0) {
      return [
        {
          ID: lead.id,
          Data: formatDate(lead.createdAt),
          Origem: getOrigemLabel(lead.origem),
          Nome: lead.nome,
          Pergunta: "Sem respostas completas",
          Resposta: "",
        },
      ];
    }

    return entries.map(([key, value]) => ({
      ID: lead.id,
      Data: formatDate(lead.createdAt),
      Origem: getOrigemLabel(lead.origem),
      Nome: lead.nome,
      Pergunta: formatAnswerKey(key),
      Resposta: formatAnswerValue(value),
    }));
  });

  const overviewColumns = [
    "ID",
    "Data",
    "Origem",
    "Nome",
    "Email",
    "Cidade",
    "WhatsApp",
    "Resultado",
    "Conceito principal",
    "Conceito complementar",
    "Lead score",
    "Tipo de obra / imóvel",
    "Tamanho",
    "Fase",
    "Projeto",
    "Orçamento / sensação",
    "Medo / imagem",
    "Prazo",
    "Investimento",
  ];
  const answerColumns = ["ID", "Data", "Origem", "Nome", "Pergunta", "Resposta"];
  const workbook = XLSX.utils.book_new();
  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows, { header: overviewColumns });
  const answersSheet = XLSX.utils.json_to_sheet(answerRows, { header: answerColumns });

  overviewSheet["!cols"] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 32 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 24 },
    { wch: 12 },
    { wch: 24 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 22 },
    { wch: 20 },
  ];
  overviewSheet["!autofilter"] = { ref: `A1:S${overviewRows.length + 1}` };

  answersSheet["!cols"] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 18 },
    { wch: 28 },
    { wch: 28 },
    { wch: 80 },
  ];
  answersSheet["!autofilter"] = { ref: `A1:F${answerRows.length + 1}` };

  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Diagnosticos");
  XLSX.utils.book_append_sheet(workbook, answersSheet, "Respostas");

  const file = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  }) as ArrayBuffer;

  return new Response(file, {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": 'attachment; filename="diagnosticos-calculadora.xlsx"',
    },
  });
}

function getOrigemLabel(origem?: string | null) {
  const map: Record<string, string> = {
    custo_invisivel: "Custo Invisível",
    casa_com_alma: "Casa com Alma",
  };

  return map[origem ?? "custo_invisivel"] ?? origem ?? "Custo Invisível";
}

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAnswerKey(key: string) {
  const labels: Record<string, string> = {
    tipoImovel: "Tipo de imóvel",
    dor: "Dor principal",
    sensacao: "Sensação desejada",
    imagem: "Imagem escolhida",
    investimento: "Investimento",
    prazo: "Prazo",
    hibrido: "Resultado híbrido",
    indices: "Índices Casa com Alma",
    lgpdConsent: "Consentimento LGPD",
    privacyAcceptedAt: "Data do aceite LGPD",
  };

  return labels[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

function formatAnswerValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  return JSON.stringify(value);
}
