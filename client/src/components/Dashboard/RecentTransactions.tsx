import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, ArrowUpRight, ArrowDownLeft, Search } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { type Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter and sort transactions
  useEffect(() => {
    const filtered = transactions
      .filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Only show the 5 most recent
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
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
  
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
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
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">
            {formattedDate} • {transaction.reference}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-medium ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
          {isDeposit ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
      </div>
    </div>
  );
}
