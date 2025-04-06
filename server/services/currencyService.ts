// Currencies data with symbols and names
export const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
];

// Exchange rates matrix (relative to USD)
// These would typically come from an external API
const exchangeRates: { [key: string]: number } = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 147.72,
  CNY: 7.23,
  AUD: 1.51,
  CAD: 1.36,
  CHF: 0.89,
  INR: 83.12,
  SGD: 1.34,
  NZD: 1.62,
  HKD: 7.81,
  KRW: 1331.22,
  MXN: 17.09,
  BRL: 5.01,
  RUB: 91.25,
  ZAR: 18.35,
  SEK: 10.46,
  NOK: 10.51,
  DKK: 6.86,
};

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string) {
  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    throw new Error("Invalid currency code");
  }
  
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  
  // Calculate conversion rates relative to USD
  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];
  
  // Convert to USD first (as the base currency), then to target currency
  const amountInUsd = amount / fromRate;
  const convertedAmount = amountInUsd * toRate;
  
  // Calculate the direct exchange rate
  const rate = toRate / fromRate;
  
  return {
    amount,
    from: fromCurrency,
    to: toCurrency,
    rate,
    convertedAmount,
    date: new Date().toISOString(),
  };
}

/**
 * Get all available currencies
 */
export function getAllCurrencies() {
  return currencies;
}

/**
 * Get exchange rates for a specific base currency
 */
export function getExchangeRates(baseCurrency: string) {
  if (!exchangeRates[baseCurrency]) {
    throw new Error("Invalid currency code");
  }
  
  const rates: { [key: string]: number } = {};
  const baseRate = exchangeRates[baseCurrency];
  
  Object.entries(exchangeRates).forEach(([currency, rate]) => {
    if (currency !== baseCurrency) {
      rates[currency] = rate / baseRate;
    }
  });
  
  return {
    base: baseCurrency,
    date: new Date().toISOString(),
    rates,
  };
}