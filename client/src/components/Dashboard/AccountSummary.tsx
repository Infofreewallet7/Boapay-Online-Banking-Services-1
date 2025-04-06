import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, ChevronRight, CreditCard, Landmark, Globe, DollarSign, Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { BankIcon, getIconForAccountType, getBgColorForAccountType, getTextColorForAccountType } from "@/lib/BankIcons";
import { type Account } from "@shared/schema";
import AccountStatement from "@/components/AccountStatement";

interface AccountSummaryProps {
  accounts: Account[];
}

export default function AccountSummary({ accounts }: AccountSummaryProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [currencyView, setCurrencyView] = useState<string>("all");
  
  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };
  
  // Group accounts by currency
  const accountsByCurrency = accounts.reduce<Record<string, Account[]>>((acc, account) => {
    const currency = account.currency || "USD";
    if (!acc[currency]) {
      acc[currency] = [];
    }
    acc[currency].push(account);
    return acc;
  }, {});
  
  // Get all unique currencies
  const currencies = Object.keys(accountsByCurrency);
  
  // Calculate total balance by currency
  const balanceByCurrency = currencies.reduce<Record<string, number>>((acc, currency) => {
    acc[currency] = accountsByCurrency[currency].reduce(
      (total, account) => total + parseFloat(account.balance.toString()),
      0
    );
    return acc;
  }, {});
  
  // Filter accounts based on selected currency view
  const filteredAccounts = currencyView === "all" 
    ? accounts 
    : accountsByCurrency[currencyView] || [];
  
  // Calculate total balance for all accounts
  const totalBalance = Object.values(balanceByCurrency).reduce((a, b) => a + b, 0);
  
  // Returns currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch(currency.toUpperCase()) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "JPY": return "¥";
      default: return "$";
    }
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
          <div className="flex flex-col space-y-4">
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
            
            {currencies.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {currencies.map(currency => (
                  <div key={currency} className="flex items-center">
                    <Badge variant="outline" className="flex items-center gap-1 py-1">
                      {getCurrencyIcon(currency)}
                      <span className="font-medium">
                        {currency}: {showBalance ? formatCurrency(balanceByCurrency[currency], currency) : "••••••"}
                      </span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {currencies.length > 1 && (
        <Tabs defaultValue="all" onValueChange={setCurrencyView} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
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
      )}
      
      <div className="grid gap-4">
        {filteredAccounts.map((account) => (
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
  const iconType = getIconForAccountType(account.accountType);
  const bgColor = getBgColorForAccountType(account.accountType);
  const textColor = getTextColorForAccountType(account.accountType);
  const currency = account.currency || "USD";
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className={`h-1 ${account.accountType.toLowerCase() === 'checking' ? 'bg-primary' : 'bg-secondary'}`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{account.accountName}</h3>
              <Badge variant="outline" className="text-xs">{currency}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              •••• {account.accountNumber.slice(-4)}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
            <BankIcon type={iconType} className={`h-5 w-5 ${textColor}`} />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-xl font-semibold text-gray-900">
              {showBalance ? formatCurrency(account.balance, currency) : "••••••"}
            </p>
          </div>
          <div className="flex gap-2">
            <AccountStatement accountId={account.id} />
            <Link to={`/accounts/${account.id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
