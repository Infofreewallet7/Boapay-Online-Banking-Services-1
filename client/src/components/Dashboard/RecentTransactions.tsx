import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Search, Globe, DollarSign, Euro, Landmark } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { type Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  
  // Get all unique currencies from transactions
  const uniqueCurrencies = new Set<string>();
  transactions.forEach(tx => uniqueCurrencies.add(tx.currency || "USD"));
  const currencies = Array.from(uniqueCurrencies).sort();
  
  // Filter and sort transactions
  useEffect(() => {
    let filtered = transactions;
    
    // Apply currency filter if not "all"
    if (currencyFilter !== "all") {
      filtered = filtered.filter(tx => (tx.currency || "USD") === currencyFilter);
    }
    
    // Apply search filter
    filtered = filtered.filter(tx => 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort by date (newest first) and limit to 5
    filtered = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, currencyFilter]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Get appropriate icon for currency
  const getCurrencyIcon = (currency: string) => {
    switch(currency.toUpperCase()) {
      case "USD": return <DollarSign className="h-4 w-4" />;
      case "EUR": return <Euro className="h-4 w-4" />;
      case "GBP": return <Landmark className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg font-medium text-gray-700">Recent Transactions</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </CardHeader>
      
      {currencies.length > 1 && (
        <div className="px-6">
          <Tabs defaultValue="all" onValueChange={setCurrencyFilter} className="w-full">
            <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${currencies.length + 1}, 1fr)` }}>
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>All</span>
              </TabsTrigger>
              {currencies.map(currency => (
                <TabsTrigger key={currency} value={currency} className="flex items-center gap-1">
                  {getCurrencyIcon(currency)}
                  <span>{currency}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Separator className="my-2" />
        </div>
      )}
      
      <CardContent className="pb-2">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Link to="/transactions">
          <Button variant="outline" size="sm" className="w-full">
            View All Transactions
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isDeposit = transaction.type === 'deposit';
  const amount = parseFloat(transaction.amount.toString());
  const currency = transaction.currency || "USD";
  
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  // Check if it's an international transaction
  const isInternational = transaction.description.toLowerCase().includes('international') || 
                           transaction.description.toLowerCase().includes('transfer') && 
                           currency !== "USD";
  
  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
          {isDeposit ? (
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{transaction.description}</p>
            {isInternational && (
              <Badge variant="secondary" className="text-xs">International</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formattedDate} • {transaction.reference}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-1">
          <p className={`font-medium ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
            {isDeposit ? '+' : '-'}{formatCurrency(amount, currency)}
          </p>
          {currency !== "USD" && (
            <Badge variant="outline" className="text-xs">{currency}</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
      </div>
    </div>
  );
}
