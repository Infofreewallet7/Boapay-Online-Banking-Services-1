import { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Info, 
  Download, 
  Filter,
  Tag as TagIcon
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { type Transaction, type Account } from "@shared/schema";
import TransactionCategorizationDialog from "./TransactionCategorizationDialog";

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
}

export default function TransactionList({ transactions, accounts }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-gray-500 mb-4">No transactions to display</p>
          <p className="text-gray-400 text-sm">Transactions will appear here as they occur</p>
        </CardContent>
      </Card>
    );
  }
  
  const getAccountName = (accountId: number) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.accountName : 'Unknown Account';
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = formatDate(transaction.createdAt);
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
      
      {/* Transaction Date Groups */}
      {Object.keys(groupedTransactions).map(date => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-gray-500">{date}</h3>
            <Separator className="flex-1" />
          </div>
          
          <Card>
            <CardContent className="p-0">
              {groupedTransactions[date].map(transaction => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction} 
                  accountName={getAccountName(transaction.accountId)}
                  onSelect={() => setSelectedTransaction(transaction)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
      
      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details of the selected transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction Type</p>
                  <p className="text-base font-semibold capitalize">{selectedTransaction.type}</p>
                </div>
                <Badge variant={selectedTransaction.status === 'completed' ? 'default' : 
                              selectedTransaction.status === 'pending' ? 'outline' : 'destructive'}
                      className={selectedTransaction.status === 'completed' ? 'bg-green-500' : ''}>
                  {selectedTransaction.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className={`text-base font-semibold ${
                    selectedTransaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account</p>
                  <p className="text-base">{getAccountName(selectedTransaction.accountId)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference</p>
                  <p className="text-base font-mono">{selectedTransaction.reference}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base">{selectedTransaction.description}</p>
              </div>
              
              {(selectedTransaction.senderAccount || selectedTransaction.receiverAccount) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {selectedTransaction.senderAccount && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">From</p>
                        <p className="text-base">{selectedTransaction.senderAccount}</p>
                      </div>
                    )}
                    {selectedTransaction.receiverAccount && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">To</p>
                        <p className="text-base">{selectedTransaction.receiverAccount}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Category Information */}
              {selectedTransaction.category && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <Badge className="capitalize">{selectedTransaction.category}</Badge>
                    </div>
                    
                    {selectedTransaction.subcategory && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-500">Subcategory</p>
                        <Badge variant="outline" className="capitalize">{selectedTransaction.subcategory}</Badge>
                      </div>
                    )}
                    
                    {selectedTransaction.tags && selectedTransaction.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedTransaction.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {selectedTransaction.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700 mt-1">{selectedTransaction.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          {selectedTransaction && (
            <DialogFooter>
              <TransactionCategorizationDialog 
                transaction={selectedTransaction}
                trigger={
                  <Button variant="outline">
                    <TagIcon className="h-4 w-4 mr-2" />
                    {selectedTransaction.category ? 'Edit Category' : 'Add Category'}
                  </Button>
                }
              />
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  accountName: string;
  onSelect: () => void;
}

function TransactionItem({ transaction, accountName, onSelect }: TransactionItemProps) {
  const isDeposit = transaction.type === 'deposit';
  const amount = parseFloat(transaction.amount.toString());
  
  return (
    <div
      className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onSelect}
    >
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
            {accountName} • {transaction.reference}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`font-medium ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
            {isDeposit ? '+' : '-'}{formatCurrency(amount)}
          </p>
          <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
        </div>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}
