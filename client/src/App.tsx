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
              <div className="flex items-center gap-2.5">
                <img
                  src="/logos/revryze-logo.png"
                  alt="Revryze"
                  className="h-10 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                  data-testid="img-logo"
                />
                <div className="hidden h-8 w-8 items-center justify-center rounded-md bg-[#10E29C]" data-testid="logo-fallback">
                  <span className="text-sm font-black text-black">R</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground" data-testid="text-brand-name">
                  Revryze
                </span>
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
