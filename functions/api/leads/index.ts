import {
  badRequest,
  classificarRisco,
  ensureLeadColumns,
  getSql,
  normalizeLeadRows,
  ok,
  readLeadInput,
  serverError,
  unauthorized,
  verifyAdmin,
  type Env,
  type LeadRow,
} from "../../_lib/api";

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const data = await readLeadInput(context.request);
    const classificacao = data.classificacao ?? classificarRisco(data);
    const sql = getSql(context.env);
    await ensureLeadColumns(sql);

    const rows = await sql`
      insert into leads (
        nome,
        email,
        cidade,
        whatsapp,
        origem,
        tipo_obra,
        tamanho,
        fase,
        projeto,
        orcamento,
        medo,
        prazo,
        investimento,
        classificacao,
        resultado,
        resultado_complementar,
        lead_score,
        answers
      )
      values (
        ${data.nome},
        ${data.email},
        ${data.cidade},
        ${data.whatsapp ?? null},
        ${data.origem ?? "custo_invisivel"},
        ${data.tipoObra},
        ${data.tamanho},
        ${data.fase},
        ${data.projeto},
        ${data.orcamento},
        ${data.medo},
        ${data.prazo},
        ${data.investimento},
        ${classificacao},
        ${data.resultado ?? null},
        ${data.resultadoComplementar ?? null},
        ${data.leadScore ?? null},
        ${data.answers ? JSON.stringify(data.answers) : null}
      )
      returning
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
    `;

    return ok(normalizeLeadRows(rows as LeadRow[])[0]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Campo")) {
      return badRequest(error.message);
    }

    return serverError();
  }
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
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

    return ok({ leads, total: leads.length });
  } catch (error) {
    return serverError(
      error instanceof Error ? error.message : "Erro ao listar leads",
    );
  }
}
