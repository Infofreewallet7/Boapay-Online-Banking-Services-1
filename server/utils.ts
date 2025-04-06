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

/**
 * Enum for account types with their corresponding prefixes
 */
export enum AccountType {
  Savings = 'savings',
  Checking = 'checking',
  Investment = 'investment',
  Express = 'express'
}

/**
 * Map of account type prefixes for account number generation
 */
export const AccountTypePrefixes: Record<AccountType, string> = {
  [AccountType.Savings]: '2000',
  [AccountType.Checking]: '1000',
  [AccountType.Investment]: '3000',
  [AccountType.Express]: '4000'
};

/**
 * Generate a random account number based on account type
 * @param accountType - The type of account (checking, savings, investment, express)
 * @param length - Length of the random part (default: 6)
 * @returns A random account number with appropriate prefix for the account type
 */
export function generateRandomAccountNumber(accountType: string = AccountType.Checking, length: number = 6): string {
  // Get the prefix for the account type or use checking account prefix as default
  const prefix = AccountTypePrefixes[accountType as AccountType] || AccountTypePrefixes[AccountType.Checking];
  
  const randomPart = Array.from(
    { length },
    () => Math.floor(Math.random() * 10).toString()
  ).join('');
  
  return `${prefix}${randomPart}`;
}