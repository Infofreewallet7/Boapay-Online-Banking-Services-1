import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { billPaymentSchema, type BillPayment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { type Account, type Bill } from "@shared/schema";

interface BillPaymentFormProps {
  accounts: Account[];
  bills: Bill[];
}

export default function BillPaymentForm({ accounts, bills }: BillPaymentFormProps) {
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  
  const form = useForm<BillPayment>({
    resolver: zodResolver(billPaymentSchema),
    defaultValues: {
      accountId: 0,
      billId: 0,
      amount: "",
    },
  });
  
  const paymentMutation = useMutation({
    mutationFn: async (data: BillPayment) => {
      return apiRequest("POST", "/api/bill-payments", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      
      toast({
        title: "Payment successful",
        description: "Your bill payment has been processed successfully.",
      });
      
      form.reset();
      setSelectedBill(null);
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: BillPayment) => {
    paymentMutation.mutate(data);
  };
  
  const handleBillChange = (billId: string) => {
    const bill = bills.find(b => b.id === parseInt(billId));
    setSelectedBill(bill || null);
    
    if (bill) {
      form.setValue("amount", bill.paymentAmount.toString());
    }
  };
  
  if (bills.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">You have no pending bills to pay</p>
        <Button variant="outline" disabled>Add a Bill</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="billId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Bill</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(parseInt(value));
                  handleBillChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bill to pay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bills.map((bill) => (
                    <SelectItem key={bill.id} value={bill.id.toString()}>
                      {bill.billName} - {formatCurrency(bill.paymentAmount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedBill && (
          <div className="p-4 bg-gray-50 rounded-md space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Bill Name:</span>
              <span className="text-sm font-medium">{selectedBill.billName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm font-medium capitalize">{selectedBill.billCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Due Date:</span>
              <span className="text-sm font-medium">
                {selectedBill.dueDate 
                  ? new Date(selectedBill.dueDate).toLocaleDateString() 
                  : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Account Number:</span>
              <span className="text-sm font-medium">{selectedBill.accountNumber}</span>
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.accountName} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the account to pay this bill from
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input {...field} className="pl-7" />
                </div>
              </FormControl>
              <FormDescription>
                Enter the amount you want to pay
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={paymentMutation.isPending}
        >
          {paymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </form>
    </Form>
  );
}
