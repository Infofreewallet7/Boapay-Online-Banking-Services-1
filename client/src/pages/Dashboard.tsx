import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AccountSummary from "@/components/Dashboard/AccountSummary";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import QuickActions from "@/components/Dashboard/QuickActions";
import WebSocketNotifications from "@/components/WebSocketNotifications";
import { Account, Transaction, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { isLoading: isLoadingUser, data: user = {} as User } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  const accountsOptions: UseQueryOptions<Account[]> = {
    queryKey: ["/api/accounts"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const { isLoading: isLoadingAccounts, data: accounts = [] } = useQuery<Account[]>(accountsOptions);
  
  const transactionsOptions: UseQueryOptions<Transaction[]> = {
    queryKey: ["/api/transactions"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const { isLoading: isLoadingTransactions, data: transactions = [] } = useQuery<Transaction[]>(transactionsOptions);
  
  const isLoading = isLoadingUser || isLoadingAccounts || isLoadingTransactions;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your dashboard...</span>
      </div>
    );
  }
  
  if (!user || !accounts) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Account Information Unavailable</h1>
          <p className="mt-2 text-gray-600">
            We couldn't retrieve your account information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">Here's an overview of your finances</p>
        </div>
        <WebSocketNotifications />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AccountSummary accounts={accounts} />
          
          <div className="mt-8">
            <RecentTransactions transactions={transactions || []} />
          </div>
        </div>
        
        <div>
          <QuickActions accounts={accounts} />
        </div>
      </div>
    </div>
  );
}
