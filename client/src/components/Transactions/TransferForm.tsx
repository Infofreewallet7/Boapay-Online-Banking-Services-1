import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { transferFundsSchema, type TransferFunds } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { type Account } from "@shared/schema";

interface TransferFormProps {
  accounts: Account[];
}

export default function TransferForm({ accounts }: TransferFormProps) {
  const { toast } = useToast();
  const [selectedFromAccount, setSelectedFromAccount] = useState<Account | null>(null);
  
  const form = useForm<TransferFunds>({
    resolver: zodResolver(transferFundsSchema),
    defaultValues: {
      fromAccount: "",
      toAccount: "",
      amount: "",
      description: "",
    },
  });
  
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFunds) => {
      return apiRequest("POST", "/api/transfers", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Transfer successful",
        description: "Your funds have been transferred successfully.",
      });
      
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error.message || "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: TransferFunds) => {
    transferMutation.mutate(data);
  };
  
  const handleFromAccountChange = (accountNumber: string) => {
    const account = accounts.find(acc => acc.accountNumber === accountNumber);
    setSelectedFromAccount(account || null);
  };
  
  if (accounts.length < 1) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">You need at least one account to make transfers</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fromAccount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFromAccountChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.accountNumber}>
                      {account.accountName} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the account you want to transfer funds from
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="toAccount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                disabled={!selectedFromAccount}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts
                    .filter(account => 
                      selectedFromAccount && account.accountNumber !== selectedFromAccount.accountNumber
                    )
                    .map((account) => (
                      <SelectItem key={account.id} value={account.accountNumber}>
                        {account.accountName} ({account.accountNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the account you want to transfer funds to
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input {...field} className="pl-7" placeholder="0.00" />
                </div>
              </FormControl>
              <FormDescription>
                Enter the amount you want to transfer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter a description for this transfer" 
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-900">
                Transfers between Boapay accounts are immediate. External transfers may take 1-3 business days to process.
              </p>
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={transferMutation.isPending}
        >
          {transferMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Transfer...
            </>
          ) : (
            "Transfer Funds"
          )}
        </Button>
      </form>
    </Form>
  );
}
