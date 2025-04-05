import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, FileDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import TransactionList from "@/components/Transactions/TransactionList";
import { type Transaction } from "@shared/schema";

export default function Transactions() {
  const { toast } = useToast();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [transactionType, setTransactionType] = useState<string>("all");
  
  const { isLoading: isLoadingAccounts, data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load accounts. Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const { isLoading: isLoadingTransactions, data: allTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const isLoading = isLoadingAccounts || isLoadingTransactions;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your transactions...</span>
      </div>
    );
  }
  
  if (!allTransactions || allTransactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Transactions Found</h1>
          <p className="mt-2 text-gray-600">
            You don't have any transactions yet. Once you start using your account, your transactions will show up here.
          </p>
        </div>
      </div>
    );
  }
  
  // Filter transactions based on selected account
  let filteredTransactions = allTransactions;
  
  if (selectedAccountId !== "all") {
    filteredTransactions = allTransactions.filter(
      transaction => transaction.accountId === parseInt(selectedAccountId)
    );
  }
  
  // Filter by transaction type
  if (transactionType !== "all") {
    filteredTransactions = filteredTransactions.filter(
      transaction => transaction.type === transactionType
    );
  }
  
  // Filter by date range
  if (dateRange !== "all") {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }
    
    filteredTransactions = filteredTransactions.filter(
      transaction => new Date(transaction.createdAt) >= startDate
    );
  }
  
  // Separate transactions by type
  const depositTransactions = filteredTransactions.filter(tx => tx.type === 'deposit');
  const withdrawalTransactions = filteredTransactions.filter(tx => tx.type === 'withdrawal');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Date Range</span>
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      
      <Card className="p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Account</label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.accountName} (•••• {account.accountNumber.slice(-4)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Type</label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TransactionList transactions={filteredTransactions} accounts={accounts || []} />
        </TabsContent>
        
        <TabsContent value="deposits">
          <TransactionList transactions={depositTransactions} accounts={accounts || []} />
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <TransactionList transactions={withdrawalTransactions} accounts={accounts || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
