import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

// Page imports (to be created)
import Dashboard from "@/pages/dashboard";
import PatientList from "@/pages/patients/list";
import PatientNew from "@/pages/patients/new";
import PatientDetail from "@/pages/patients/detail";
import AssessmentNew from "@/pages/assessments/new";
import AssessmentDetail from "@/pages/assessments/detail";
import RiskMonitor from "@/pages/risk-monitor";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={PatientList} />
        <Route path="/patients/new" component={PatientNew} />
        <Route path="/patients/:id" component={PatientDetail} />
        <Route path="/assessments/new" component={AssessmentNew} />
        <Route path="/assessments/:id" component={AssessmentDetail} />
        <Route path="/risk-monitor" component={RiskMonitor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
