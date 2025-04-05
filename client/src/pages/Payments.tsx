import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TransferForm from "@/components/Transactions/TransferForm";
import BillPaymentForm from "@/components/Payments/BillPaymentForm";
import BillPaymentList from "@/components/Payments/BillPaymentList";

export default function Payments() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("bills");
  
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
  
  const { isLoading: isLoadingBills, data: bills } = useQuery({
    queryKey: ["/api/bills"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load bills. Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  const isLoading = isLoadingAccounts || isLoadingBills;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading payment options...</span>
      </div>
    );
  }
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Accounts Available</h1>
          <p className="mt-2 text-gray-600">
            You need an account to make payments. Please contact customer support to open a new account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Transfers</h1>
        <p className="text-gray-600">Manage your payments and transfers</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
          <TabsTrigger value="bills">Bill Payments</TabsTrigger>
          <TabsTrigger value="transfer">Fund Transfer</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pay Your Bills</CardTitle>
                  <CardDescription>
                    Select a bill to pay from your list of pending bills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BillPaymentForm 
                    accounts={accounts} 
                    bills={bills?.filter(bill => bill.status === 'pending') || []}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Bills</CardTitle>
                    <CardDescription>Your pending bills</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  {bills && bills.filter(bill => bill.status === 'pending').length > 0 ? (
                    <BillPaymentList bills={bills.filter(bill => bill.status === 'pending')} />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">You have no pending bills.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="transfer">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Funds</CardTitle>
                  <CardDescription>
                    Transfer money between your accounts or to other Boapay accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm accounts={accounts} />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Quick Tips</CardTitle>
                    <CardDescription>For smooth transfers</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-gray-700">Double-check account numbers before confirming transfers</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-gray-700">Transfers between Boapay accounts are instant</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-gray-700">External transfers may take 1-3 business days</p>
                    </div>
                    <div className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-sm text-gray-700">Save frequent transfers as templates for quick access</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all your past payments and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Your payment history will be shown here</p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("bills")}
                >
                  Make a Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
