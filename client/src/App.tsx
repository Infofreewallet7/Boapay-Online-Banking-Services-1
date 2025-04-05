import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Accounts from "@/pages/Accounts";
import Transactions from "@/pages/Transactions";
import Payments from "@/pages/Payments";
import Support from "@/pages/Support";
import Settings from "@/pages/Settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

function Router() {
  const [location] = useLocation();
  const isAuthenticated = !!queryClient.getQueryData(["api/auth/session"]);
  const isHomePage = location === "/";
  
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/session"],
    enabled: !isHomePage && !isAuthenticated,
    retry: false
  });
  
  if (!isHomePage && !isAuthenticated && isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          
          {/* Protected routes - require authentication */}
          <Route path="/dashboard">
            {isAuthenticated ? <Dashboard /> : <Home />}
          </Route>
          <Route path="/accounts">
            {isAuthenticated ? <Accounts /> : <Home />}
          </Route>
          <Route path="/transactions">
            {isAuthenticated ? <Transactions /> : <Home />}
          </Route>
          <Route path="/payments">
            {isAuthenticated ? <Payments /> : <Home />}
          </Route>
          <Route path="/support">
            {isAuthenticated ? <Support /> : <Home />}
          </Route>
          <Route path="/settings">
            {isAuthenticated ? <Settings /> : <Home />}
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
