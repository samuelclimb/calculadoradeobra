# Deploy gratuito

Este projeto pode rodar como um unico servico Node: o Express serve `/api` e tambem os arquivos estaticos gerados pelo Vite.

## Variaveis obrigatorias

- `DATABASE_URL`: URL Postgres.
- `ADMIN_PASSWORD`: senha do painel admin, com pelo menos 8 caracteres.
- `NODE_ENV`: `production`.

## Build e start

- Build command: `pnpm install --frozen-lockfile && pnpm run build:deploy`
- Start command: `pnpm run start`

## Banco

Crie a tabela executando o conteudo de `schema.sql` no Postgres. Alternativa para ambiente local com dependencias instaladas:

```sh
pnpm --filter @workspace/db run push
```

## Sugestao de hospedagem

Use Render para o servico web e Neon ou Supabase para o Postgres. Depois de configurar as variaveis no servico web, o site, o formulario e o painel `/admin` ficam no mesmo dominio.
