import { storage } from "../storage";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "../utils";
import PDFDocument from "pdfkit";

interface StatementOptions {
  accountId: number;
  startDate?: Date;
  endDate?: Date;
  includeAllTransactions?: boolean;
}

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

/**
 * Generate account statement data for a specific account and date range
 */
export async function generateStatementData({
  accountId,
  startDate = new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to one month ago
  endDate = new Date(),
  includeAllTransactions = false,
}: StatementOptions): Promise<StatementData> {
  // Get account information
  const account = await storage.getAccount(accountId);
  if (!account) {
    throw new Error("Account not found");
  }

  // Get user information
  const user = await storage.getUser(account.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get transactions for the account
  let transactions = await storage.getAccountTransactions(accountId);

  // Filter transactions by date range if not including all transactions
  if (!includeAllTransactions) {
    transactions = transactions.filter(
      (tx) => new Date(tx.createdAt) >= startDate && new Date(tx.createdAt) <= endDate
    );
  }

  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate totals
  const totalCredits = transactions
    .filter((tx) => parseFloat(tx.amount) > 0)
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const totalDebits = transactions
    .filter((tx) => parseFloat(tx.amount) < 0)
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

  // Calculate opening and closing balances
  // For simplicity, we'll use the current balance minus the sum of transactions
  // in the period as the opening balance
  const transactionSum = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const openingBalance = parseFloat(account.balance.toString()) - transactionSum;
  const closingBalance = parseFloat(account.balance.toString());

  // Format dates
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  // Create account name (First Name + Last Name + Account Type)
  const accountName = `${user.firstName} ${user.lastName} - ${account.accountType}`;

  const statementData: StatementData = {
    accountNumber: account.accountNumber,
    accountName,
    accountType: account.accountType,
    currency: account.currency,
    balance: formatCurrency(account.balance, account.currency),
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    transactions,
    openingBalance: formatCurrency(openingBalance, account.currency),
    closingBalance: formatCurrency(closingBalance, account.currency),
    totalCredits: formatCurrency(totalCredits, account.currency),
    totalDebits: formatCurrency(totalDebits, account.currency),
  };

  return statementData;
}

/**
 * Generate a PDF account statement
 */
export function generatePdfStatement(statementData: StatementData): any {
  const doc = new PDFDocument({ margin: 50 });

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Add document header
  doc.fontSize(20).text('BOAPAY', { align: 'center' });
  doc.fontSize(16).text('Account Statement', { align: 'center' });
  doc.moveDown();

  // Add statement information
  doc.fontSize(12).text(`Account: ${statementData.accountName}`);
  doc.text(`Account Number: ${statementData.accountNumber}`);
  doc.text(`Account Type: ${statementData.accountType}`);
  doc.text(`Currency: ${statementData.currency}`);
  doc.text(`Statement Period: ${formatDate(statementData.startDate)} to ${formatDate(statementData.endDate)}`);
  doc.moveDown();

  // Add summary
  doc.fontSize(14).text('Summary', { underline: true });
  doc.fontSize(12).text(`Opening Balance: ${statementData.openingBalance}`);
  doc.text(`Closing Balance: ${statementData.closingBalance}`);
  doc.text(`Total Credits: ${statementData.totalCredits}`);
  doc.text(`Total Debits: ${statementData.totalDebits}`);
  doc.moveDown(2);

  // Add transactions table
  doc.fontSize(14).text('Transactions', { underline: true });
  doc.moveDown();

  // Define table layout
  const tableTop = doc.y;
  const dateX = 50;
  const descriptionX = 150;
  const amountX = 400;
  const balanceX = 500;

  // Add table header
  doc.fontSize(10)
    .text('Date', dateX, tableTop)
    .text('Description', descriptionX, tableTop)
    .text('Amount', amountX, tableTop)
    .text('Balance', balanceX, tableTop);
  
  // Draw header line
  doc.moveTo(50, doc.y + 5)
    .lineTo(550, doc.y + 5)
    .stroke();
  
  doc.moveDown();
  let rowY = doc.y;

  // Add transactions
  let runningBalance = parseFloat(statementData.openingBalance.replace(/[^0-9.-]+/g, ''));
  
  for (const tx of statementData.transactions) {
    // Update running balance
    runningBalance += parseFloat(tx.amount.toString());
    
    // Format date
    const txDate = formatDate(tx.createdAt.toString());
    
    // Format amount with color indication (credits are positive, debits are negative)
    const amountStr = formatCurrency(parseFloat(tx.amount.toString()), statementData.currency);
    
    // Format description (truncate if too long)
    let description = tx.description;
    if (description.length > 30) {
      description = description.substring(0, 27) + '...';
    }
    
    // Add transaction row
    doc.text(txDate, dateX, rowY)
      .text(description, descriptionX, rowY)
      .text(amountStr, amountX, rowY)
      .text(formatCurrency(runningBalance, statementData.currency), balanceX, rowY);
    
    // Move to next row
    doc.moveDown();
    rowY = doc.y;
    
    // Add page if needed
    if (rowY > 700) {
      doc.addPage();
      doc.text('Transaction Date', dateX, 50)
        .text('Description', descriptionX, 50)
        .text('Amount', amountX, 50)
        .text('Balance', balanceX, 50);
      
      doc.moveTo(50, 65)
        .lineTo(550, 65)
        .stroke();
      
      doc.moveDown();
      rowY = doc.y;
    }
  }

  // Add footer
  doc.fontSize(8).text(
    'This statement was generated automatically by Boapay. For any questions, please contact support.',
    50, 
    700, 
    { align: 'center' }
  );

  return doc;
}