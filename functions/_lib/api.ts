import { neon } from "@neondatabase/serverless";

type Env = {
  DATABASE_URL: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
};

type LeadRow = {
  id: number;
  nome: string;
  email: string;
  cidade: string;
  whatsapp: string | null;
  origem?: string | null;
  tipoObra: string;
  tamanho: string;
  fase: string;
  projeto: string;
  orcamento: string;
  medo: string;
  prazo: string;
  investimento: string;
  classificacao: "baixo" | "medio" | "alto" | "critico";
  resultado?: string | null;
  resultadoComplementar?: string | null;
  leadScore?: number | null;
  answers?: Record<string, unknown> | null;
  createdAt: string | Date;
};

type LeadInput = {
  nome: string;
  email: string;
  cidade: string;
  whatsapp?: string;
  origem?: string;
  tipoObra: string;
  tamanho: string;
  fase: string;
  projeto: string;
  orcamento: string;
  medo: string;
  prazo: string;
  investimento: string;
  classificacao?: "baixo" | "medio" | "alto" | "critico";
  resultado?: string;
  resultadoComplementar?: string;
  leadScore?: number;
  answers?: Record<string, unknown>;
};

const requiredLeadFields: Array<keyof LeadInput> = [
  "nome",
  "email",
  "cidade",
  "tipoObra",
  "tamanho",
  "fase",
  "projeto",
  "orcamento",
  "medo",
  "prazo",
  "investimento",
];

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

export function ok(data: unknown): Response {
  return json(data);
}

export function badRequest(message: string): Response {
  return json({ error: message }, { status: 400 });
}

export function unauthorized(message = "Senha de administrador inválida"): Response {
  return json({ error: message }, { status: 401 });
}

export function serverError(message = "Erro interno do servidor"): Response {
  return json({ error: message }, { status: 500 });
}

export function getSql(env: Env) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  return neon(env.DATABASE_URL);
}

export async function ensureLeadColumns(sql: ReturnType<typeof neon>) {
  await sql`alter table leads add column if not exists origem text not null default 'custo_invisivel'`;
  await sql`alter table leads add column if not exists resultado text`;
  await sql`alter table leads add column if not exists resultado_complementar text`;
  await sql`alter table leads add column if not exists lead_score integer`;
  await sql`alter table leads add column if not exists answers jsonb`;
}

function normalizeLeadRow(row: LeadRow): LeadRow {
  return {
    ...row,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  };
}

export function normalizeLeadRows(rows: LeadRow[]): LeadRow[] {
  return rows.map(normalizeLeadRow);
}

export async function readLeadInput(request: Request): Promise<LeadInput> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    throw new Error("JSON inválido");
  }

  for (const field of requiredLeadFields) {
    if (typeof (body as Record<string, unknown>)[field] !== "string") {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  const whatsapp = (body as Record<string, unknown>).whatsapp;
  if (whatsapp !== undefined && typeof whatsapp !== "string") {
    throw new Error("Campo inválido: whatsapp");
  }

  const origem = (body as Record<string, unknown>).origem;
  if (origem !== undefined && typeof origem !== "string") {
    throw new Error("Campo inválido: origem");
  }

  const resultado = (body as Record<string, unknown>).resultado;
  if (resultado !== undefined && typeof resultado !== "string") {
    throw new Error("Campo inválido: resultado");
  }

  const resultadoComplementar = (body as Record<string, unknown>)
    .resultadoComplementar;
  if (
    resultadoComplementar !== undefined &&
    typeof resultadoComplementar !== "string"
  ) {
    throw new Error("Campo inválido: resultadoComplementar");
  }

  const leadScore = (body as Record<string, unknown>).leadScore;
  if (leadScore !== undefined && typeof leadScore !== "number") {
    throw new Error("Campo inválido: leadScore");
  }

  const answers = (body as Record<string, unknown>).answers;
  if (
    answers !== undefined &&
    (!answers || typeof answers !== "object" || Array.isArray(answers))
  ) {
    throw new Error("Campo inválido: answers");
  }

  return body as LeadInput;
}

export function classificarRisco(data: {
  fase: string;
  projeto: string;
  orcamento: string;
  prazo: string;
  investimento: string;
  medo: string;
}): "baixo" | "medio" | "alto" | "critico" {
  const { fase, projeto, orcamento, prazo, investimento, medo } = data;

  if (fase === "A obra já começou" || prazo === "Já comecei") {
    return "critico";
  }

  let score = 0;

  if (projeto === "Não tenho" || projeto === "Não sei a diferença") score += 3;
  else if (
    projeto === "Tenho referências" ||
    projeto === "Tenho planta simples"
  ) {
    score += 2;
  } else if (projeto === "Tenho projeto 3D") {
    score += 1;
  }

  if (orcamento === "Não tenho") score += 2;
  else if (orcamento === "Estimativa informal") score += 1;

  if (prazo === "Agora" || prazo === "Em até 30 dias") score += 2;
  else if (prazo === "1 a 3 meses") score += 1;

  if (
    investimento === "Acima de R$ 300 mil" ||
    investimento === "R$ 150 a 300 mil"
  ) {
    score += 2;
  } else if (investimento === "R$ 80 a 150 mil") {
    score += 1;
  }

  if (
    medo === "Ter retrabalho" ||
    medo === "Estourar o orçamento" ||
    medo === "Atrasar a obra"
  ) {
    score += 1;
  }

  if (score >= 7) return "alto";
  if (score >= 4) return "medio";
  return "baixo";
}

export function formatarClassificacao(classificacao: string): string {
  const labels: Record<string, string> = {
    baixo: "Baixo",
    medio: "Médio",
    alto: "Alto",
    critico: "Crítico",
  };

  return labels[classificacao] ?? classificacao;
}

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return hex(buffer);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export async function verifyAdmin(request: Request, env: Env): Promise<boolean> {
  const password = request.headers.get("x-admin-password");
  if (!password) return false;

  if (env.ADMIN_PASSWORD_HASH) {
    const [algorithm, salt, expectedHash] = env.ADMIN_PASSWORD_HASH.split(":");
    if (algorithm !== "sha256" || !salt || !expectedHash) {
      return false;
    }

    const actualHash = await sha256(`${salt}:${password}`);
    return timingSafeEqual(actualHash, expectedHash);
  }

  if (env.ADMIN_PASSWORD) {
    return timingSafeEqual(password, env.ADMIN_PASSWORD);
  }

  return false;
}

export function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";

  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export type { Env, LeadInput, LeadRow };
