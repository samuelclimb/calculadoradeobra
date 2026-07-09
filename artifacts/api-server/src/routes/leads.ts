import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import crypto from "node:crypto";
import * as XLSX from "xlsx";
import {
  CreateLeadBody,
  CreateLeadResponse,
  ListLeadsHeader,
  ListLeadsResponse,
  ExportLeadsHeader,
  GetLeadsStatsHeader,
  GetLeadsStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_HASH_PREFIX = "scrypt";

function hashAdminPassword(password: string, salt: string): string {
  return crypto
    .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
    .toString("hex");
}

function timingSafeEqualText(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function verifyAdminPassword(password: string): boolean {
  const adminPasswordHash = process.env["ADMIN_PASSWORD_HASH"];

  if (adminPasswordHash) {
    const parts = adminPasswordHash.includes(":")
      ? adminPasswordHash.split(":")
      : adminPasswordHash.split("$");
    const [algorithm, salt, expectedHash] = parts;
    if (algorithm !== ADMIN_HASH_PREFIX || !salt || !expectedHash) {
      return false;
    }

    const actualHash = hashAdminPassword(password, salt);
    return timingSafeEqualText(actualHash, expectedHash);
  }

  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    return false;
  }

  return timingSafeEqualText(password, adminPassword);
}

// Classify risk based on calculator responses
// Each risk factor contributes points; final score determines classification.
function classificarRisco(data: {
  fase: string;
  projeto: string;
  orcamento: string;
  prazo: string;
  investimento: string;
  medo: string;
}): "baixo" | "medio" | "alto" | "critico" {
  const { fase, projeto, orcamento, prazo, investimento, medo } = data;

  // Critico: obra já começou regardless of other factors
  if (fase === "A obra já começou" || prazo === "Já comecei") {
    return "critico";
  }

  let score = 0;

  // --- Project status (0-3 pts) ---
  if (projeto === "Não tenho" || projeto === "Não sei a diferença") score += 3;
  else if (projeto === "Tenho referências" || projeto === "Tenho planta simples") score += 2;
  else if (projeto === "Tenho projeto 3D") score += 1;
  // "Tenho projeto completo" = 0

  // --- Budget maturity (0-2 pts) ---
  if (orcamento === "Não tenho") score += 2;
  else if (orcamento === "Estimativa informal") score += 1;
  // "Orçamento detalhado" = 0

  // --- Start timeline (0-2 pts) ---
  if (prazo === "Agora" || prazo === "Em até 30 dias") score += 2;
  else if (prazo === "1 a 3 meses") score += 1;
  // "3 a 6 meses" or "Sem prazo definido" = 0

  // --- Investment size (0-2 pts) ---
  if (investimento === "Acima de R$ 300 mil" || investimento === "R$ 150 a 300 mil") score += 2;
  else if (investimento === "R$ 80 a 150 mil") score += 1;
  // Smaller amounts = 0

  // --- Fear signal (0-1 pt) ---
  if (medo === "Ter retrabalho" || medo === "Estourar o orçamento" || medo === "Atrasar a obra") score += 1;

  // --- Map score to classification ---
  // Max possible score = 10
  if (score >= 7) return "alto";
  if (score >= 4) return "medio";
  return "baixo";
}

function formatarClassificacao(classificacao: string): string {
  const labels: Record<string, string> = {
    baixo: "Baixo",
    medio: "Médio",
    alto: "Alto",
    critico: "Crítico",
  };

  return labels[classificacao] ?? classificacao;
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

// Middleware to validate admin password
function requireAdmin(req: any, res: any, next: any): void {
  const headerResult = ListLeadsHeader.safeParse(req.headers);
  if (!headerResult.success) {
    res.status(401).json({ error: "Senha de administrador não fornecida" });
    return;
  }

  if (!process.env["ADMIN_PASSWORD_HASH"] && !process.env["ADMIN_PASSWORD"]) {
    req.log.error("Admin password env var not set");
    res.status(500).json({ error: "Configuração de servidor inválida" });
    return;
  }

  if (!verifyAdminPassword(headerResult.data["x-admin-password"])) {
    res.status(401).json({ error: "Senha de administrador inválida" });
    return;
  }

  next();
}

// POST /leads — create a lead
router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid lead data");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const classificacao = classificarRisco(parsed.data);

  const [lead] = await db
    .insert(leadsTable)
    .values({
      nome: parsed.data.nome,
      email: parsed.data.email,
      cidade: parsed.data.cidade,
      whatsapp: parsed.data.whatsapp ?? null,
      tipoObra: parsed.data.tipoObra,
      tamanho: parsed.data.tamanho,
      fase: parsed.data.fase,
      projeto: parsed.data.projeto,
      orcamento: parsed.data.orcamento,
      medo: parsed.data.medo,
      prazo: parsed.data.prazo,
      investimento: parsed.data.investimento,
      classificacao,
    })
    .returning();

  res.status(201).json(
    CreateLeadResponse.parse({
      id: lead.id,
      nome: lead.nome,
      email: lead.email,
      cidade: lead.cidade,
      whatsapp: lead.whatsapp,
      tipoObra: lead.tipoObra,
      tamanho: lead.tamanho,
      fase: lead.fase,
      projeto: lead.projeto,
      orcamento: lead.orcamento,
      medo: lead.medo,
      prazo: lead.prazo,
      investimento: lead.investimento,
      classificacao: lead.classificacao,
      createdAt: lead.createdAt.toISOString(),
    })
  );
});

// GET /leads/export — export as Excel (admin only) — must be before /leads/:id to avoid route conflict
router.get("/leads/export", requireAdmin, async (req, res): Promise<void> => {
  ExportLeadsHeader.parse(req.headers);

  const leads = await db
    .select()
    .from(leadsTable)
    .orderBy(desc(leadsTable.createdAt));

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
    const answers = lead.answers && typeof lead.answers === "object" && !Array.isArray(lead.answers)
      ? lead.answers as Record<string, unknown>
      : {};
    const entries = Object.entries(answers);

    if (entries.length === 0) {
      return [{
        ID: lead.id,
        Data: formatDate(lead.createdAt),
        Origem: getOrigemLabel(lead.origem),
        Nome: lead.nome,
        Pergunta: "Sem respostas completas",
        Resposta: "",
      }];
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

  const workbook = XLSX.utils.book_new();
  const overviewSheet = XLSX.utils.json_to_sheet(overviewRows);
  const answersSheet = XLSX.utils.json_to_sheet(answerRows);

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
    type: "buffer",
    compression: true,
  }) as Buffer;

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="diagnosticos-calculadora.xlsx"'
  );
  res.send(file);
});

// GET /leads/stats — statistics (admin only)
router.get("/leads/stats", requireAdmin, async (req, res): Promise<void> => {
  GetLeadsStatsHeader.parse(req.headers);

  const [totalRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leadsTable);

  const classRows = await db
    .select({
      classificacao: leadsTable.classificacao,
      count: sql<number>`count(*)::int`,
    })
    .from(leadsTable)
    .groupBy(leadsTable.classificacao);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leadsTable)
    .where(sql`${leadsTable.createdAt} >= ${sevenDaysAgo}`);

  const porClassificacao = { baixo: 0, medio: 0, alto: 0, critico: 0 };
  for (const row of classRows) {
    const key = row.classificacao as keyof typeof porClassificacao;
    if (key in porClassificacao) {
      porClassificacao[key] = row.count;
    }
  }

  res.json(
    GetLeadsStatsResponse.parse({
      total: totalRow?.count ?? 0,
      porClassificacao,
      ultimosSete: recentRow?.count ?? 0,
    })
  );
});

// GET /leads — list all leads (admin only)
router.get("/leads", requireAdmin, async (req, res): Promise<void> => {
  const leads = await db
    .select()
    .from(leadsTable)
    .orderBy(desc(leadsTable.createdAt));

  res.json(
    ListLeadsResponse.parse({
      leads: leads.map((lead) => ({
        id: lead.id,
        nome: lead.nome,
        email: lead.email,
        cidade: lead.cidade,
        whatsapp: lead.whatsapp,
        tipoObra: lead.tipoObra,
        tamanho: lead.tamanho,
        fase: lead.fase,
        projeto: lead.projeto,
        orcamento: lead.orcamento,
        medo: lead.medo,
        prazo: lead.prazo,
        investimento: lead.investimento,
        classificacao: lead.classificacao,
        createdAt: lead.createdAt.toISOString(),
      })),
      total: leads.length,
    })
  );
});

export default router;
