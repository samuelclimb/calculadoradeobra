import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Calculator from '@/pages/Calculator';
import Result from '@/pages/Result';
import Admin from '@/pages/Admin';
import CasaComAlma from '@/pages/CasaComAlma';
import CasaComAlmaResult from '@/pages/CasaComAlmaResult';
import Privacy from '@/pages/Privacy';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
      <Route path="/calculadora" component={Calculator} />
      <Route path="/casa-com-alma" component={CasaComAlma} />
      <Route path="/casa-com-alma/resultado" component={CasaComAlmaResult} />
      <Route path="/resultado" component={Result} />
      <Route path="/admin" component={Admin} />
      <Route path="/privacidade" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
