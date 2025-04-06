import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, ArrowRightLeft, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Types for currency data
type Currency = {
  code: string;
  name: string;
  symbol: string;
};

type ConversionResult = {
  amount: number;
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
  date: string;
};

export default function CurrencyConverter() {
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Fetch available currencies
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery<Currency[]>({
    queryKey: ["/api/currencies"],
    staleTime: 86400000, // 24 hours
  });

  // Conversion mutation
  const conversionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/convert-currency", {
        amount,
        from: fromCurrency,
        to: toCurrency,
      });
    },
    onSuccess: async (response) => {
      const result: ConversionResult = await response.json();
      setConvertedAmount(result.convertedAmount);
      setExchangeRate(result.rate);
    },
    onError: (error) => {
      toast({
        title: "Conversion failed",
        description: error.message || "Could not convert currency. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Swap currencies
  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    
    // Convert again after swap
    if (!conversionMutation.isPending) {
      setTimeout(() => convertCurrency(), 100);
    }
  };

  // Convert currency
  const convertCurrency = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    conversionMutation.mutate();
  };

  // Initial conversion on component mount
  useEffect(() => {
    convertCurrency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-primary text-white">
        <CardTitle className="text-xl font-bold">Currency Converter</CardTitle>
        <CardDescription className="text-white text-opacity-80">
          Get real-time exchange rates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              placeholder="Enter amount"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">From</label>
              {isLoadingCurrencies ? (
                <SelectTrigger className="w-full" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </SelectTrigger>
              ) : (
                <Select 
                  value={fromCurrency} 
                  onValueChange={setFromCurrency}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies?.map((currency: Currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleSwapCurrencies}
              className="mt-5"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              {isLoadingCurrencies ? (
                <SelectTrigger className="w-full" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </SelectTrigger>
              ) : (
                <Select 
                  value={toCurrency} 
                  onValueChange={setToCurrency}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies?.map((currency: Currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Button 
            onClick={convertCurrency} 
            className="w-full"
            disabled={conversionMutation.isPending}
          >
            {conversionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              "Convert"
            )}
          </Button>

          {convertedAmount !== null && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-1">Result</h3>
              <p className="text-2xl font-bold">
                {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency} = 
              </p>
              <p className="text-3xl font-bold text-primary">
                {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center">
          {exchangeRate !== null && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exchange rate as of {new Date().toLocaleDateString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}