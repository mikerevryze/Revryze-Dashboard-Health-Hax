import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <img
                  src="/logos/revryze-icon.png"
                  alt="Revryze"
                  className="h-9 w-9 rounded-lg"
                  data-testid="img-logo"
                />
                <img
                  src="/logos/revryze-wordmark.png"
                  alt="Revryze"
                  className="hidden h-7 w-auto sm:block"
                  data-testid="img-wordmark"
                />
              </div>
            </div>
          </header>
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
