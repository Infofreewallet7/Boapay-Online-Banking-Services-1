import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getQueryFn } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Transaction } from "@shared/schema";

interface StatementData {
  accountNumber: string;
  accountName: string;
  accountType: string;
  currency: string;
  balance: string;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
  openingBalance: string;
  closingBalance: string;
  totalDebits: string;
  totalCredits: string;
}

interface AccountStatementProps {
  accountId: number;
}

export default function AccountStatement({ accountId }: AccountStatementProps) {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1))); // Default to 1 month ago
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeAll, setIncludeAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Query to get statement data
  const { data: statement, isLoading, error } = useQuery<StatementData>({
    queryKey: [
      `/api/accounts/${accountId}/statement`, 
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeAll: includeAll.toString()
      }
    ],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: dialogOpen,
  });

  // Function to download statement PDF
  const downloadStatement = () => {
    const queryParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      includeAll: includeAll.toString()
    });

    window.open(`/api/accounts/${accountId}/statement/pdf?${queryParams}`, '_blank');
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          View Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Account Statement</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          {!statement && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="mb-2 block">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="md:col-span-2 flex items-center space-x-2">
                <Switch 
                  id="include-all" 
                  checked={includeAll}
                  onCheckedChange={setIncludeAll}
                />
                <Label htmlFor="include-all">Include all transactions (ignore date range)</Label>
              </div>
              
              <div className="md:col-span-2">
                <Button 
                  className="w-full" 
                  onClick={() => setDialogOpen(true)}
                >
                  Generate Statement
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">
              Error loading statement: {error instanceof Error ? error.message : "Unknown error"}
            </div>
          )}

          {statement && (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => setDialogOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              
              <Card>
                <CardHeader>
                  <CardTitle>{statement.accountName}</CardTitle>
                  <CardDescription>
                    Account Number: {statement.accountNumber}<br />
                    Period: {format(new Date(statement.startDate), "PPP")} to {format(new Date(statement.endDate), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium">Opening Balance</p>
                      <p className="text-2xl font-bold">{statement.openingBalance}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Closing Balance</p>
                      <p className="text-2xl font-bold">{statement.closingBalance}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Credits</p>
                      <p className="text-xl font-semibold text-green-600">{statement.totalCredits}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Debits</p>
                      <p className="text-xl font-semibold text-red-600">{statement.totalDebits}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                      <div>Date</div>
                      <div className="col-span-2">Description</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="divide-y max-h-[300px] overflow-y-auto">
                      {statement.transactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-4 gap-4 p-3 text-sm">
                          <div>{format(new Date(tx.createdAt), "PP")}</div>
                          <div className="col-span-2">{tx.description}</div>
                          <div className={`text-right ${parseFloat(String(tx.amount)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(parseFloat(String(tx.amount)), statement.currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={downloadStatement}>
                    <Download className="h-4 w-4" />
                    Download PDF Statement
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}