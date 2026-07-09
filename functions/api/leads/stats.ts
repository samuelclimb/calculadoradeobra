import {
  getSql,
  ok,
  unauthorized,
  verifyAdmin,
  type Env,
} from "../../_lib/api";

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  if (!(await verifyAdmin(context.request, context.env))) {
    return unauthorized();
  }

  const sql = getSql(context.env);
  const totalRows = await sql`select count(*)::int as count from leads`;
  const classRows = await sql`
    select classificacao, count(*)::int as count
    from leads
    group by classificacao
  `;
  const recentRows = await sql`
    select count(*)::int as count
    from leads
    where created_at >= now() - interval '7 days'
  `;

  const porClassificacao = { baixo: 0, medio: 0, alto: 0, critico: 0 };
  for (const row of classRows as Array<{
    classificacao: keyof typeof porClassificacao;
    count: number;
  }>) {
    if (row.classificacao in porClassificacao) {
      porClassificacao[row.classificacao] = row.count;
    }
  }

  return ok({
    total: Number((totalRows[0] as { count: number } | undefined)?.count ?? 0),
    porClassificacao,
    ultimosSete: Number(
      (recentRows[0] as { count: number } | undefined)?.count ?? 0,
    ),
  });
}
