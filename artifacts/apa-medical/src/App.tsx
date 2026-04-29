import { Component, type ErrorInfo, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import PatientList from "@/pages/patients/list";
import PatientNew from "@/pages/patients/new";
import PatientDetail from "@/pages/patients/detail";
import AssessmentNew from "@/pages/assessments/new";
import AssessmentDetail from "@/pages/assessments/detail";
import RiskMonitor from "@/pages/risk-monitor";

// ── QueryClient ────────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry once on error, not 3 times (faster UX feedback)
      retry: 1,
      // Stale data shown immediately, refreshed in background
      staleTime: 1000 * 30, // 30 seconds
      // Don't refetch when window regains focus in medical context
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ── Error Boundary ─────────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
          <div className="max-w-md w-full mx-4 p-8 bg-white rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                Une erreur est survenue
              </h1>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              L'application a rencontré une erreur inattendue. Veuillez
              rafraîchir la page ou contacter le support si le problème
              persiste.
            </p>
            {this.state.error && (
              <pre className="text-xs text-slate-400 bg-slate-50 rounded p-3 overflow-auto max-h-24 mb-4">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Router ─────────────────────────────────────────────────────────────────────
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

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  // Normalize BASE_URL: strip trailing slash, default to "" for root
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryErrorResetBoundary>
          {() => (
            <TooltipProvider>
              <WouterRouter base={base}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          )}
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
