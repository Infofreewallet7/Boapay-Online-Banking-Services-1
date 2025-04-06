import { Switch, Route } from "wouter";
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
import AuthPage from "@/pages/auth-page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes - require authentication */}
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/accounts" component={Accounts} />
          <ProtectedRoute path="/transactions" component={Transactions} />
          <ProtectedRoute path="/payments" component={Payments} />
          <ProtectedRoute path="/support" component={Support} />
          <ProtectedRoute path="/settings" component={Settings} />
          
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
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
