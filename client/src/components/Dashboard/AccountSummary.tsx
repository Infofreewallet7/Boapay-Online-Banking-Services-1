import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, ChevronRight, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { type Account } from "@shared/schema";

interface AccountSummaryProps {
  accounts: Account[];
}

export default function AccountSummary({ accounts }: AccountSummaryProps) {
  const [showBalance, setShowBalance] = useState(true);
  
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };
  
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce(
    (total, account) => total + parseFloat(account.balance.toString()),
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Account Summary</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleBalanceVisibility}
          className="flex items-center gap-2"
        >
          {showBalance ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span>Show</span>
            </>
          )}
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-bold text-gray-900">
              {showBalance ? formatCurrency(totalBalance) : "••••••"}
            </h3>
            <Link to="/accounts">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            showBalance={showBalance}
          />
        ))}
      </div>
    </div>
  );
}

interface AccountCardProps {
  account: Account;
  showBalance: boolean;
}

function AccountCard({ account, showBalance }: AccountCardProps) {
  const accountTypeColor = 
    account.accountType.toLowerCase() === 'checking' 
      ? 'bg-primary' 
      : 'bg-secondary';
  
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${accountTypeColor}`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium text-gray-900">{account.accountName}</h3>
            <p className="text-sm text-gray-500">
              •••• {account.accountNumber.slice(-4)}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-full ${accountTypeColor} bg-opacity-10 flex items-center justify-center`}>
            <CreditCard className={`h-5 w-5 ${account.accountType.toLowerCase() === 'checking' ? 'text-primary' : 'text-secondary'}`} />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-xl font-semibold text-gray-900">
              {showBalance ? formatCurrency(account.balance) : "••••••"}
            </p>
          </div>
          <Link to={`/accounts/${account.id}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
