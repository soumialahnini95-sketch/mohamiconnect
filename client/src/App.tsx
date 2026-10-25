import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AdminLawyers from "./pages/AdminLawyers";
import Home from "./pages/Home";
import LawyerDashboard from "./pages/LawyerDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/avocat" component={LawyerDashboard} />
      <Route path="/admin/avocats" component={AdminLawyers} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
