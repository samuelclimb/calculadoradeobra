import {
  escapeCsv,
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
  const rows = await sql`
    select
      id,
      nome,
      email,
      cidade,
      whatsapp,
      tipo_obra as "tipoObra",
      tamanho,
      fase,
      projeto,
      orcamento,
      medo,
      prazo,
      investimento,
      classificacao,
      created_at as "createdAt"
    from leads
    order by created_at desc
  `;
  const leads = normalizeLeadRows(rows as LeadRow[]);

  const headers = [
    "ID",
    "Nome",
    "Email",
    "Cidade",
    "WhatsApp",
    "Tipo de Obra",
    "Tamanho",
    "Fase",
    "Projeto",
    "Orçamento",
    "Medo",
    "Prazo",
    "Investimento",
    "Resultado do diagnóstico",
    "Data",
  ];

  const csvRows = leads.map((lead) =>
    [
      String(lead.id),
      lead.nome,
      lead.email,
      lead.cidade,
      lead.whatsapp ?? "",
      lead.tipoObra,
      lead.tamanho,
      lead.fase,
      lead.projeto,
      lead.orcamento,
      lead.medo,
      lead.prazo,
      lead.investimento,
      formatarClassificacao(lead.classificacao),
      String(lead.createdAt),
    ]
      .map(escapeCsv)
      .join(","),
  );

  const csv = [headers.join(","), ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="leads-calculadora.csv"',
    },
  });
}
