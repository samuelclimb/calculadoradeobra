import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListLeads, useGetLeadsStats, getListLeadsQueryKey, getGetLeadsStatsQueryKey } from "@workspace/api-client-react";
import { Download, Lock, LogOut, Search, Loader2, AlertTriangle, Users, TrendingUp, AlertOctagon, Leaf } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Admin() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState("");

  const headers = useMemo(() => ({ 'x-admin-password': password }), [password]);

  // Queries only run if authenticated
  const {
    data: leadsData,
    isLoading: isLoadingLeads,
    error: leadsError,
  } = useListLeads({
    query: { enabled: isAuthenticated, queryKey: getListLeadsQueryKey() },
    request: { headers }
  });

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetLeadsStats({
    query: { enabled: isAuthenticated, queryKey: getGetLeadsStatsQueryKey() },
    request: { headers }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      setIsAuthenticated(true);
      // refetch will happen automatically because enabled becomes true
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    queryClient.removeQueries({ queryKey: getListLeadsQueryKey() });
    queryClient.removeQueries({ queryKey: getGetLeadsStatsQueryKey() });
  };

  const handleExport = () => {
    // using manual fetch so we can pass the auth header
    fetch('/api/leads/export', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao exportar');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao exportar CSV. Verifique a senha.');
      });
  };

  // If password was wrong on fetch
  if (isAuthenticated && leadsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full p-8 rounded-3xl border border-card-border bg-card text-center flex flex-col gap-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" strokeWidth={1.5} />
          <div>
            <h2 className="font-serif text-xl font-semibold mb-2">Acesso negado</h2>
            <p className="text-muted-foreground">A senha fornecida está incorreta ou expirou.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-primary text-primary-foreground rounded-full font-medium py-3 px-4 w-full hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/20">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Lock className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">Área restrita</h1>
            <p className="text-muted-foreground">Acesso administrativo ao painel de leads.</p>
          </div>

          <form onSubmit={handleLogin} className="bg-card rounded-3xl p-8 border border-card-border flex flex-col gap-6 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha de acesso
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-b-2 border-border bg-transparent px-0 py-3 text-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground rounded-full font-medium py-4 text-lg mt-2 hover:bg-primary/90 transition-colors"
            >
              Acessar painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const leads = leadsData?.leads || [];
  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(search.toLowerCase()) ||
    lead.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/40">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-serif font-semibold tracking-tight text-primary">
          <Leaf className="h-5 w-5" strokeWidth={1.5} />
          <span>Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      <main className="flex-1 p-6 md:p-10 container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">Leads capturados</h1>
            <p className="text-muted-foreground">Monitoramento de risco financeiro de potenciais clientes.</p>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium hover:bg-primary/90 transition-colors self-start md:self-auto"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>

        {/* Stats Section */}
        {isLoadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-muted border border-border"></div>)}
          </div>
        ) : statsData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-card rounded-2xl border border-card-border p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Users className="h-4 w-4" /> Total
              </span>
              <span className="font-serif text-4xl font-semibold mt-2">{statsData.total}</span>
            </div>
            <div className="bg-destructive/10 rounded-2xl border border-destructive/20 p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-destructive uppercase flex items-center gap-2">
                <AlertOctagon className="h-4 w-4" /> Risco crítico
              </span>
              <span className="font-serif text-4xl font-semibold text-destructive mt-2">
                {statsData.porClassificacao.critico}
              </span>
            </div>
            <div className="bg-accent/10 rounded-2xl border border-accent/20 p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-accent uppercase flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Risco alto
              </span>
              <span className="font-serif text-4xl font-semibold text-accent mt-2">
                {statsData.porClassificacao.alto}
              </span>
            </div>
            <div className="bg-card rounded-2xl border border-card-border p-6 flex flex-col justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Últimos 7 dias
              </span>
              <span className="font-serif text-4xl font-semibold mt-2">+{statsData.ultimosSete}</span>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-card rounded-t-2xl border border-b-0 border-card-border p-4 flex items-center gap-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none flex-1 font-medium placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-b-2xl border border-card-border overflow-x-auto">
          {isLoadingLeads ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p className="font-medium">Carregando base de leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-semibold text-lg text-foreground">Nenhum lead encontrado.</p>
              <p>A base está vazia no momento.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider font-semibold text-xs">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Nome / Contato</th>
                  <th className="px-6 py-4">Local</th>
                  <th className="px-6 py-4">Obra / Fase</th>
                  <th className="px-6 py-4">Risco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{lead.nome}</div>
                      <div className="text-muted-foreground">{lead.email}</div>
                      {lead.whatsapp && <div className="text-muted-foreground text-xs mt-1">{lead.whatsapp}</div>}
                    </td>
                    <td className="px-6 py-4">{lead.cidade}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{lead.tipoObra}</div>
                      <div className="text-muted-foreground text-xs">{lead.fase}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge classificacao={lead.classificacao} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function RiskBadge({ classificacao }: { classificacao: string }) {
  const map: Record<string, { label: string; className: string }> = {
    baixo: { label: "Baixo", className: "bg-primary/10 text-primary border-primary/20" },
    medio: { label: "Médio", className: "bg-amber-50 text-amber-800 border-amber-200" },
    alto: { label: "Alto", className: "bg-accent/10 text-accent border-accent/25" },
    critico: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/25 font-semibold" },
  };

  const config = map[classificacao] || map.baixo;

  return (
    <span className={`px-3 py-1 rounded-full border text-xs uppercase tracking-wider inline-block ${config.className}`}>
      {config.label}
    </span>
  );
}
