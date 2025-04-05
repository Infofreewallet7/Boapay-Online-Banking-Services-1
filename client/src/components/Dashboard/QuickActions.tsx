import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeftRight, 
  CreditCard, 
  ReceiptText, 
  PiggyBank,
  Repeat,
  History,
  Loader2
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
  
  const navigateTo = (path: string) => {
    setLocation(path);
  };

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
                          {account.accountName} ({formatCurrency(account.balance)})
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
                      <SelectItem value="electric">Electricity Bill</SelectItem>
                      <SelectItem value="water">Water Bill</SelectItem>
                      <SelectItem value="internet">Internet Bill</SelectItem>
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
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium text-gray-900">Electricity Bill</p>
                <p className="text-xs text-gray-500">Due in 5 days</p>
              </div>
              <p className="font-medium text-gray-900">$85.50</p>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium text-gray-900">Internet Service</p>
                <p className="text-xs text-gray-500">Due in 10 days</p>
              </div>
              <p className="font-medium text-gray-900">$65.99</p>
            </div>
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
          <CardTitle className="text-lg font-medium text-gray-700">Scheduled Transfers</CardTitle>
          <CardDescription>Your upcoming transfers</CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-gray-500">No scheduled transfers</p>
          <Button variant="ghost" size="sm" className="mt-2">
            <Repeat className="h-4 w-4 mr-2" />
            Set up Recurring Transfer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
