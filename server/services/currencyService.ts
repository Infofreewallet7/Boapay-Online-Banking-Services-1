/**
 * Currency Exchange Service
 * 
 * This service handles currency exchange rate operations.
 * In a production app, this would likely call an external API
 * to get real-time exchange rates.
 */

// Supported currencies
export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CAD = "CAD",
  AUD = "AUD",
  CHF = "CHF",
  CNY = "CNY",
  INR = "INR",
  SGD = "SGD"
}

// Currency symbols for display
export const CurrencySymbols: Record<Currency, string> = {
  [Currency.USD]: "$",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
  [Currency.JPY]: "¥",
  [Currency.CAD]: "CA$",
  [Currency.AUD]: "A$",
  [Currency.CHF]: "CHF",
  [Currency.CNY]: "¥",
  [Currency.INR]: "₹",
  [Currency.SGD]: "S$"
};

// Currency names for display
export const CurrencyNames: Record<Currency, string> = {
  [Currency.USD]: "US Dollar",
  [Currency.EUR]: "Euro",
  [Currency.GBP]: "British Pound",
  [Currency.JPY]: "Japanese Yen",
  [Currency.CAD]: "Canadian Dollar",
  [Currency.AUD]: "Australian Dollar",
  [Currency.CHF]: "Swiss Franc",
  [Currency.CNY]: "Chinese Yuan",
  [Currency.INR]: "Indian Rupee",
  [Currency.SGD]: "Singapore Dollar"
};

// Static exchange rates (USD to X)
// In a real app, these would be fetched from an API
const exchangeRates: Record<Currency, number> = {
  [Currency.USD]: 1.0,
  [Currency.EUR]: 0.93,
  [Currency.GBP]: 0.79,
  [Currency.JPY]: 149.50,
  [Currency.CAD]: 1.37,
  [Currency.AUD]: 1.53,
  [Currency.CHF]: 0.88,
  [Currency.CNY]: 7.24,
  [Currency.INR]: 83.50,
  [Currency.SGD]: 1.35
};

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.values(Currency);
}

/**
 * Get information about all supported currencies
 */
export function getCurrencyInfo(): Array<{ code: Currency, name: string, symbol: string }> {
  return getSupportedCurrencies().map(code => ({
    code,
    name: CurrencyNames[code],
    symbol: CurrencySymbols[code]
  }));
}

/**
 * Get exchange rate from one currency to another
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  // For cross-currency conversions, we convert to USD first, then to the target currency
  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];
  
  // Convert fromCurrency to USD, then USD to toCurrency
  return toRate / fromRate;
}

/**
 * Convert an amount from one currency to another
 * @param amount Amount to convert
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Calculate the fee for an international transfer
 * @param amount Amount to transfer
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 */
export function calculateTransferFee(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  // Base fee rate is 1%
  let feeRate = 0.01;
  
  // Add 0.5% for exotic currency pairs
  const exoticCurrencies = [Currency.CNY, Currency.INR, Currency.SGD];
  if (
    exoticCurrencies.includes(fromCurrency) || 
    exoticCurrencies.includes(toCurrency)
  ) {
    feeRate += 0.005;
  }
  
  return amount * feeRate;
}

/**
 * Get the conversion details for a transfer
 */
export function getTransferConversionDetails(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
) {
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const fee = calculateTransferFee(amount, fromCurrency, toCurrency);
  const amountAfterFee = amount - fee;
  const convertedAmount = amountAfterFee * exchangeRate;
  
  return {
    exchangeRate,
    fee,
    amountAfterFee,
    convertedAmount,
    fromCurrency,
    toCurrency
  };
}