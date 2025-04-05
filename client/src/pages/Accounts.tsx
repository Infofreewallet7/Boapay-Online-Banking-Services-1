import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CreditCard, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { type Account } from "@shared/schema";

export default function Accounts() {
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  
  const { isLoading, data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your accounts...</span>
      </div>
    );
  }
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Accounts Found</h1>
          <p className="mt-2 text-gray-600">
            You don't have any accounts yet. Please contact customer support to open a new account.
          </p>
        </div>
      </div>
    );
  }
  
  const checkingAccounts = accounts.filter(account => account.accountType.toLowerCase() === 'checking');
  const savingsAccounts = accounts.filter(account => account.accountType.toLowerCase() === 'savings');
  const otherAccounts = accounts.filter(account => 
    !['checking', 'savings'].includes(account.accountType.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Accounts</h1>
          <p className="text-gray-600">Manage and view all your accounts</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBalanceVisibility}
          className="flex items-center gap-2"
        >
          {showBalance ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Hide Balances</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Show Balances</span>
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="checking">Checking</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {accounts.map(account => (
            <AccountCard 
              key={account.id}
              account={account}
              showBalance={showBalance}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="checking" className="space-y-6">
          {checkingAccounts.length > 0 ? (
            checkingAccounts.map(account => (
              <AccountCard 
                key={account.id}
                account={account}
                showBalance={showBalance}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No checking accounts found.</p>
          )}
        </TabsContent>
        
        <TabsContent value="savings" className="space-y-6">
          {savingsAccounts.length > 0 ? (
            savingsAccounts.map(account => (
              <AccountCard 
                key={account.id}
                account={account}
                showBalance={showBalance}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No savings accounts found.</p>
          )}
        </TabsContent>
        
        <TabsContent value="other" className="space-y-6">
          {otherAccounts.length > 0 ? (
            otherAccounts.map(account => (
              <AccountCard 
                key={account.id}
                account={account}
                showBalance={showBalance}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No other accounts found.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  showBalance: boolean;
}

function AccountCard({ account, showBalance }: AccountCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <div className={`h-2 ${account.accountType.toLowerCase() === 'checking' ? 'bg-primary' : 'bg-secondary'}`}></div>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{account.accountName}</CardTitle>
          <CardDescription className="mt-1">
            Account Number: •••• {account.accountNumber.slice(-4)}
          </CardDescription>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <CreditCard className={`h-6 w-6 ${account.accountType.toLowerCase() === 'checking' ? 'text-primary' : 'text-secondary'}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Current Balance</p>
            <p className="text-2xl font-bold mt-1">
              {showBalance ? formatCurrency(account.balance) : '••••••'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Type</p>
            <p className="text-base mt-1 capitalize">{account.accountType}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" size="sm">View Transactions</Button>
        <Button size="sm">Transfer Money</Button>
      </CardFooter>
    </Card>
  );
}
