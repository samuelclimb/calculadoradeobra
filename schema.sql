CREATE TABLE IF NOT EXISTS leads (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  cidade text NOT NULL,
  whatsapp text,
  tipo_obra text NOT NULL,
  tamanho text NOT NULL,
  fase text NOT NULL,
  projeto text NOT NULL,
  orcamento text NOT NULL,
  medo text NOT NULL,
  prazo text NOT NULL,
  investimento text NOT NULL,
  classificacao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
