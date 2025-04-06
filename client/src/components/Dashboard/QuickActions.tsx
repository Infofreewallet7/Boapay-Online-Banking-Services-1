import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeftRight, 
  CreditCard, 
  ReceiptText, 
  PiggyBank,
  Repeat,
  History,
  Loader2,
  Globe,
  BadgeDollarSign,
  DollarSign,
  Euro,
  BanknoteIcon,
  ExternalLink
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
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { type Account } from "@shared/schema";

interface QuickActionsProps {
  accounts: Account[];
}

export default function QuickActions({ accounts }: QuickActionsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [currencyExchangeDialogOpen, setCurrencyExchangeDialogOpen] = useState(false);
  const [sendMoneyDialogOpen, setSendMoneyDialogOpen] = useState(false);
  
  // Check if we have multi-currency accounts
  const uniqueCurrencies = new Set<string>();
  accounts.forEach(acc => uniqueCurrencies.add(acc.currency || "USD"));
  const hasMutliCurrencyAccounts = uniqueCurrencies.size > 1;
  
  const navigateTo = (path: string) => {
    setLocation(path);
  };
  
  // Group upcoming bills by currency
  const upcomingBills = [
    { 
      id: 1, 
      name: "Electricity Bill", 
      dueInDays: 5, 
      amount: 85.50, 
      currency: "USD" 
    },
    { 
      id: 2, 
      name: "Internet Service", 
      dueInDays: 10, 
      amount: 65.99, 
      currency: "USD" 
    }
  ];
  
  // Add Euro bills if we have Euro accounts
  if (accounts.some(acc => acc.currency === "EUR")) {
    upcomingBills.push({ 
      id: 3, 
      name: "Mobile Service", 
      dueInDays: 15, 
      amount: 49.99, 
      currency: "EUR" 
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Quick Actions</CardTitle>
          <CardDescription>Common banking tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pt-0">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigateTo("/payments")}
          >
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            <span>Transfer</span>
          </Button>
          
          <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <ReceiptText className="h-6 w-6 text-primary" />
                <span>Pay Bill</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Pay a Bill</DialogTitle>
                <DialogDescription>
                  Select an account and enter bill payment details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="account">From Account</Label>
                  <Select>
                    <SelectTrigger id="account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountName} ({formatCurrency(account.balance, account.currency)})
                          {account.currency !== "USD" && ` - ${account.currency}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bill">Select Bill</Label>
                  <Select>
                    <SelectTrigger id="bill">
                      <SelectValue placeholder="Choose a bill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electric">Electricity Bill - $85.50</SelectItem>
                      <SelectItem value="water">Water Bill - $45.75</SelectItem>
                      <SelectItem value="internet">Internet Bill - $65.99</SelectItem>
                      {accounts.some(acc => acc.currency === "EUR") && (
                        <SelectItem value="mobile">Mobile Service - €49.99</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="Enter amount" />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setTransferDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    setTransferDialogOpen(false);
                    toast({
                      title: "Action Required",
                      description: "Please use the Payments page for bill payments",
                    });
                    navigateTo("/payments");
                  }}
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {hasMutliCurrencyAccounts && (
            <>
              <Dialog open={currencyExchangeDialogOpen} onOpenChange={setCurrencyExchangeDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <BadgeDollarSign className="h-6 w-6 text-primary" />
                    <span>Exchange</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Currency Exchange</DialogTitle>
                    <DialogDescription>
                      Exchange money between your different currency accounts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fromAccount">From Account</Label>
                      <Select>
                        <SelectTrigger id="fromAccount">
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountName} ({formatCurrency(account.balance, account.currency)}) - {account.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="toAccount">To Account</Label>
                      <Select>
                        <SelectTrigger id="toAccount">
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountName} ({formatCurrency(account.balance, account.currency)}) - {account.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="exchangeAmount">Amount</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="USD">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="USD" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="exchangeAmount" placeholder="Enter amount" className="flex-1" />
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Exchange Rate</span>
                        <span className="text-sm font-medium">1 USD = 0.92 EUR</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500">Fee</span>
                        <span className="text-sm font-medium">$2.50</span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrencyExchangeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setCurrencyExchangeDialogOpen(false);
                        toast({
                          title: "Exchange Initiated",
                          description: "Please complete your currency exchange on the Payments page",
                        });
                        navigateTo("/payments");
                      }}
                    >
                      Continue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={sendMoneyDialogOpen} onOpenChange={setSendMoneyDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-6 w-6 text-primary" />
                    <span>Send Money</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Send Money Internationally</DialogTitle>
                    <DialogDescription>
                      Send money to international bank accounts in different currencies.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sourceAccount">From Account</Label>
                      <Select>
                        <SelectTrigger id="sourceAccount">
                          <SelectValue placeholder="Select your account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.accountName} ({formatCurrency(account.balance, account.currency)}) - {account.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="targetAccount">Recipient</Label>
                      <Select>
                        <SelectTrigger id="targetAccount">
                          <SelectValue placeholder="Select or add recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">+ Add New Recipient</SelectItem>
                          <SelectItem value="acme">ACME Corp - DE12345678901234567890</SelectItem>
                          <SelectItem value="eurosup">EuroSupplier - FR7612345678901234567890123</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="internationalAmount">Amount</Label>
                      <div className="flex gap-2">
                        <Select defaultValue="USD">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="USD" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input id="internationalAmount" placeholder="Enter amount" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setSendMoneyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        setSendMoneyDialogOpen(false);
                        toast({
                          title: "International Transfer",
                          description: "Please complete your international transfer on the Payments page",
                        });
                        navigateTo("/payments");
                      }}
                    >
                      Continue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigateTo("/accounts")}
          >
            <CreditCard className="h-6 w-6 text-primary" />
            <span>Accounts</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => navigateTo("/transactions")}
          >
            <History className="h-6 w-6 text-primary" />
            <span>History</span>
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Upcoming Bills</CardTitle>
          <CardDescription>Bills due in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{bill.name}</p>
                    {bill.currency !== "USD" && (
                      <Badge variant="outline" className="text-xs">{bill.currency}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Due in {bill.dueInDays} days</p>
                </div>
                <p className="font-medium text-gray-900">
                  {formatCurrency(bill.amount, bill.currency)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigateTo("/payments")}
          >
            View All Bills
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Exchange Rates</CardTitle>
          <CardDescription>Current rates for your currencies</CardDescription>
        </CardHeader>
        <CardContent className="py-2">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium">USD / EUR</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">0.92</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs text-green-600">+0.03%</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate increased by 0.03% today</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-600" />
                <span className="font-medium">EUR / USD</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">1.09</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs text-red-600">-0.01%</Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate decreased by 0.01% today</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setCurrencyExchangeDialogOpen(true)}
          >
            <BanknoteIcon className="h-4 w-4 mr-2" />
            Convert Currency
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
