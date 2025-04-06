import { Currency, CurrencySymbols } from './services/currencyService';

/**
 * Format a number as a currency string
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Use the currency code to get the symbol
  const symbol = CurrencySymbols[currencyCode as Currency] || '$';
  
  // Format the amount with 2 decimal places
  return `${symbol}${numericAmount.toFixed(2)}`;
}