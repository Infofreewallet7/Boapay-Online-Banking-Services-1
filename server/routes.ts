import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { 
  loginUserSchema, 
  insertUserSchema, 
  transferFundsSchema, 
  billPaymentSchema,
  insertExternalBankAccountSchema,
  internationalTransferSchema,
  insertLoanSchema,
  insertLoanApplicationSchema,
  loanApplicationRequestSchema,
  approveLoanSchema,
  rejectLoanSchema,
  cryptoPurchaseSchema,
  cryptoExchangeSchema,
  insertCryptoTransferRequestSchema,
  approveCryptoTransferSchema
} from "@shared/schema";
import { 
  getCurrencyInfo, 
  getTransferConversionDetails, 
  Currency
} from "./services/currencyService";
import { generateStatementData, generatePdfStatement } from "./services/statementService";
import { nanoid } from "nanoid";

// Helper function to get userId from session
function getUserId(req: Request): number | undefined {
  return req.session.userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "boapay-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: storage.sessionStore,
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Prefix all routes with /api
  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ message: "Invalid username or password" });
      }
      
      const { username, password } = validatedData.data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Return user data without password
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const userData = validatedData.data;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Store user ID in session
      req.session.userId = user.id;
      
      // Return user data without password
      const { password, ...newUserData } = user;
      res.status(201).json(newUserData);
    } catch (error) {
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  
  app.get("/api/auth/session", async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Account Routes
  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accounts = await storage.getUserAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching accounts" });
    }
  });
  
  app.get("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching account" });
    }
  });
  
  // Transaction Routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching transactions" });
    }
  });
  
  app.get("/api/accounts/:id/transactions", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transactions = await storage.getAccountTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching transactions" });
    }
  });
  
  // Transfer Funds
  app.post("/api/transfers", requireAuth, async (req, res) => {
    try {
      const validatedData = transferFundsSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { fromAccount, toAccount, amount, description } = validatedData.data;
      const transferAmount = parseFloat(amount);
      
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccountByNumber(fromAccount);
      if (!sourceAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if there is enough balance
      if (parseFloat(sourceAccount.balance.toString()) < transferAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Get destination account
      const destAccount = await storage.getAccountByNumber(toAccount);
      if (!destAccount) {
        return res.status(404).json({ message: "Destination account not found" });
      }
      
      // Generate reference
      const reference = `TRX${nanoid(8).toUpperCase()}`;
      
      // Create withdrawal transaction
      const withdrawalTx = await storage.createTransaction({
        accountId: sourceAccount.id,
        amount: transferAmount.toString(),
        type: "withdrawal",
        description,
        reference,
        status: "completed",
        receiverAccount: toAccount,
      });
      
      // Create deposit transaction
      const depositTx = await storage.createTransaction({
        accountId: destAccount.id,
        amount: transferAmount.toString(),
        type: "deposit",
        description,
        reference,
        status: "completed",
        senderAccount: fromAccount,
      });
      
      // Update account balances
      await storage.updateAccountBalance(sourceAccount.id, -transferAmount);
      await storage.updateAccountBalance(destAccount.id, transferAmount);
      
      res.status(201).json({ message: "Transfer completed successfully", reference });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during transfer" });
    }
  });
  
  // Bill Routes
  app.get("/api/bills", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bills = await storage.getUserBills(userId);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching bills" });
    }
  });
  
  // Bill Payment
  app.post("/api/bill-payments", requireAuth, async (req, res) => {
    try {
      const validatedData = billPaymentSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { accountId, billId, amount } = validatedData.data;
      const paymentAmount = parseFloat(amount);
      
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get account
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get bill
      const bill = await storage.getBill(billId);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Check if the bill belongs to the current user
      if (bill.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if there is enough balance
      if (parseFloat(account.balance.toString()) < paymentAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Generate reference
      const reference = `BPY${nanoid(8).toUpperCase()}`;
      
      // Create bill payment
      const payment = await storage.createBillPayment({
        billId,
        accountId,
        amount: paymentAmount.toString(),
        reference,
        status: "completed",
      });
      
      // Create transaction
      await storage.createTransaction({
        accountId,
        amount: paymentAmount.toString(),
        type: "withdrawal",
        description: `Bill Payment - ${bill.billName}`,
        reference,
        status: "completed",
        receiverAccount: bill.accountNumber,
      });
      
      // Update account balance
      await storage.updateAccountBalance(accountId, -paymentAmount);
      
      // Update bill status
      await storage.updateBillStatus(billId, "paid");
      
      res.status(201).json({ message: "Bill payment completed successfully", reference });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during bill payment" });
    }
  });

  // External Bank Account Routes
  app.get("/api/external-bank-accounts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accounts = await storage.getUserExternalBankAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching external bank accounts" });
    }
  });

  app.get("/api/external-bank-accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getExternalBankAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "External bank account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching external bank account" });
    }
  });

  app.post("/api/external-bank-accounts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertExternalBankAccountSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      // Add the current user's ID to the data
      const accountData = {
        ...validatedData.data,
        userId: req.session.userId,
      };
      
      const account = await storage.createExternalBankAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while creating external bank account" });
    }
  });

  app.put("/api/external-bank-accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getExternalBankAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "External bank account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertExternalBankAccountSchema.partial().safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const updatedAccount = await storage.updateExternalBankAccount(accountId, validatedData.data);
      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating external bank account" });
    }
  });

  app.delete("/api/external-bank-accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getExternalBankAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "External bank account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteExternalBankAccount(accountId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting external bank account" });
    }
  });

  // International Transfer Routes
  app.get("/api/international-transfers", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const transfers = await storage.getUserInternationalTransfers(userId);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching international transfers" });
    }
  });

  app.get("/api/accounts/:id/international-transfers", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.getAccount(accountId);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const transfers = await storage.getAccountInternationalTransfers(accountId);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching international transfers" });
    }
  });

  app.post("/api/international-transfers", requireAuth, async (req, res) => {
    try {
      const validatedData = internationalTransferSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { sourceAccountId, externalAccountId, amount, purposeOfTransfer } = validatedData.data;
      const transferAmount = parseFloat(amount);
      
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccount(sourceAccountId);
      if (!sourceAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get external account
      const externalAccount = await storage.getExternalBankAccount(externalAccountId);
      if (!externalAccount) {
        return res.status(404).json({ message: "External bank account not found" });
      }
      
      // Check if the external account belongs to the current user
      if (externalAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get source and target currencies
      const sourceCurrency = sourceAccount.currency || "USD";
      const targetCurrency = externalAccount.currency;
      
      // Calculate conversion details and fees using the currency service
      const conversionDetails = getTransferConversionDetails(
        transferAmount,
        sourceCurrency as Currency,
        targetCurrency as Currency
      );
      
      const { 
        exchangeRate, 
        fee: feeAmount, 
        amountAfterFee,
        convertedAmount 
      } = conversionDetails;
      
      const totalAmount = transferAmount + feeAmount;
      
      // Check if there is enough balance (including fees)
      if (parseFloat(sourceAccount.balance.toString()) < totalAmount) {
        return res.status(400).json({ message: "Insufficient funds (including fees)" });
      }
      
      // Generate reference
      const reference = `INT${nanoid(8).toUpperCase()}`;
      
      // Create international transfer
      const transfer = await storage.createInternationalTransfer({
        sourceAccountId,
        externalAccountId,
        amount: transferAmount.toString(),
        exchangeRate: exchangeRate.toString(),
        sourceCurrency,
        targetCurrency,
        fees: feeAmount.toString(),
        totalDebit: totalAmount.toString(),
        reference,
        purposeOfTransfer,
        status: "pending", // Start as pending
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      });
      
      // Create transaction for the debit
      await storage.createTransaction({
        accountId: sourceAccountId,
        amount: totalAmount.toString(),
        type: "withdrawal",
        description: `International Transfer to ${externalAccount.accountName} (${externalAccount.bankName})`,
        reference,
        status: "completed",
        receiverAccount: externalAccount.accountNumber,
      });
      
      // Update account balance
      await storage.updateAccountBalance(sourceAccountId, -totalAmount);
      
      // In a real app, we would have a background job that processes the transfers
      // and updates their status. For now, we'll simulate success after a delay
      setTimeout(async () => {
        await storage.updateInternationalTransferStatus(transfer.id, "completed");
      }, 30000); // 30 seconds delay for demo purposes
      
      res.status(201).json({ 
        message: "International transfer initiated successfully", 
        reference,
        estimatedDelivery: transfer.estimatedDelivery,
        transferId: transfer.id,
        conversionDetails: {
          exchangeRate,
          fee: feeAmount,
          amountAfterFee,
          convertedAmount,
          sourceCurrency,
          targetCurrency
        }
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred during international transfer" });
    }
  });

  app.get("/api/international-transfers/:id", requireAuth, async (req, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const transfer = await storage.getInternationalTransfer(transferId);
      
      if (!transfer) {
        return res.status(404).json({ message: "International transfer not found" });
      }
      
      // Get source account to check ownership
      const sourceAccount = await storage.getAccount(transfer.sourceAccountId);
      if (!sourceAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get source and target currencies
      const sourceCurrency = transfer.sourceCurrency as Currency;
      const targetCurrency = transfer.targetCurrency as Currency;
      
      // Calculate current conversion details
      const currentConversionDetails = getTransferConversionDetails(
        parseFloat(transfer.amount),
        sourceCurrency,
        targetCurrency
      );
      
      // Create response with both original and current conversion details
      const response = {
        ...transfer,
        currentConversionDetails: {
          exchangeRate: currentConversionDetails.exchangeRate,
          convertedAmount: currentConversionDetails.convertedAmount,
          fee: currentConversionDetails.fee,
          amountAfterFee: currentConversionDetails.amountAfterFee
        },
        originalExchangeRate: parseFloat(transfer.exchangeRate || "1")
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching international transfer" });
    }
  });

  // Currency routes
  app.get("/api/currencies", async (req, res) => {
    try {
      const currencies = getCurrencyInfo();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching currencies" });
    }
  });

  app.post("/api/currencies/convert", async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;
      
      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          errors: ["amount, fromCurrency, and toCurrency are required"] 
        });
      }
      
      const numericAmount = parseFloat(amount);
      
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Check if currencies are valid
      const validCurrencies = Object.values(Currency);
      if (!validCurrencies.includes(fromCurrency as Currency) || 
          !validCurrencies.includes(toCurrency as Currency)) {
        return res.status(400).json({ message: "Invalid currency code" });
      }
      
      const conversionDetails = getTransferConversionDetails(
        numericAmount,
        fromCurrency as Currency,
        toCurrency as Currency
      );
      
      res.json(conversionDetails);
    } catch (error) {
      res.status(500).json({ message: "An error occurred during currency conversion" });
    }
  });

  // Account Statement Routes
  app.get("/api/accounts/:id/statement", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const { startDate, endDate, includeAll } = req.query;
      
      // Get account
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Generate statement data
      const statementData = await generateStatementData({
        accountId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeAllTransactions: includeAll === 'true'
      });
      
      res.json(statementData);
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating account statement",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Download Account Statement as PDF
  app.get("/api/accounts/:id/statement/pdf", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const { startDate, endDate, includeAll } = req.query;
      
      // Get account
      const account = await storage.getAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Check if the account belongs to the current user
      if (account.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Generate statement data
      const statementData = await generateStatementData({
        accountId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeAllTransactions: includeAll === 'true'
      });
      
      // Generate PDF
      const doc = generatePdfStatement(statementData);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="statement-${account.accountNumber}.pdf"`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      doc.end();
      
    } catch (error) {
      res.status(500).json({ 
        message: "An error occurred while generating PDF statement",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Loan Routes
  app.get("/api/loans", requireAuth, async (req, res) => {
    try {
      const loans = await storage.getAllLoans();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching loans" });
    }
  });

  app.get("/api/loans/:id", requireAuth, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      const loan = await storage.getLoan(loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching loan" });
    }
  });

  // Loan Application Routes
  app.get("/api/loan-applications", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const applications = await storage.getUserLoanApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching loan applications" });
    }
  });

  app.post("/api/loan-applications", requireAuth, async (req, res) => {
    try {
      const validatedData = loanApplicationRequestSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validatedData.error.errors
        });
      }
      
      const { loanId, accountId, requestedAmount, term, purposeOfLoan, monthlyIncome, employmentStatus, employerName, employmentDuration, creditScore, existingDebt } = validatedData.data;
      
      // Verify loan exists
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan type not found" });
      }
      
      // Verify account exists and belongs to user
      if (accountId) {
        const account = await storage.getAccount(accountId);
        if (!account) {
          return res.status(404).json({ message: "Account not found" });
        }
        
        if (account.userId !== req.session.userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Create loan application
      const loanApplication = await storage.createLoanApplication({
        userId: req.session.userId,
        loanId,
        accountId,
        requestedAmount,
        term,
        purposeOfLoan,
        monthlyIncome,
        employmentStatus,
        employerName: employerName || "",
        employmentDuration: employmentDuration || 0,
        creditScore: creditScore || 0,
        existingDebt: existingDebt || ""
      });
      
      res.status(201).json(loanApplication);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while creating loan application" });
    }
  });

  app.get("/api/loan-applications/:id", requireAuth, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const application = await storage.getLoanApplication(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Loan application not found" });
      }
      
      // Check if the application belongs to the current user
      if (application.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching loan application" });
    }
  });

  // Admin routes for loan applications
  app.get("/api/admin/loan-applications/pending", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applications = await storage.getPendingLoanApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching pending loan applications" });
    }
  });

  app.post("/api/admin/loan-applications/:id/approve", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applicationId = parseInt(req.params.id);
      const validatedData = approveLoanSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validatedData.error.errors
        });
      }
      
      const { approvedAmount, approvedTermMonths, approvedInterestRate } = validatedData.data;
      
      const application = await storage.approveLoanApplication(
        applicationId,
        user.id,
        parseFloat(approvedAmount),
        approvedTermMonths,
        parseFloat(approvedInterestRate)
      );
      
      if (!application) {
        return res.status(404).json({ message: "Loan application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while approving loan application" });
    }
  });

  app.post("/api/admin/loan-applications/:id/reject", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const applicationId = parseInt(req.params.id);
      const validatedData = rejectLoanSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validatedData.error.errors
        });
      }
      
      const { rejectionReason } = validatedData.data;
      
      const application = await storage.rejectLoanApplication(
        applicationId,
        user.id,
        rejectionReason
      );
      
      if (!application) {
        return res.status(404).json({ message: "Loan application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while rejecting loan application" });
    }
  });

  // Cryptocurrency Routes
  app.get("/api/cryptocurrencies", requireAuth, async (req, res) => {
    try {
      const cryptocurrencies = await storage.getAllCryptocurrencies();
      res.json(cryptocurrencies);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching cryptocurrencies" });
    }
  });

  app.get("/api/crypto-accounts", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const accounts = await storage.getUserCryptoAccounts(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching crypto accounts" });
    }
  });

  // Crypto Purchase
  app.post("/api/crypto/purchase", requireAuth, async (req, res) => {
    try {
      const validatedData = cryptoPurchaseSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { sourceAccountId, cryptoSymbol, amount } = validatedData.data;
      const purchaseAmount = parseFloat(amount);
      
      if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccount(sourceAccountId);
      if (!sourceAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get the cryptocurrency
      const crypto = await storage.getCryptocurrencyBySymbol(cryptoSymbol);
      if (!crypto) {
        return res.status(404).json({ message: "Cryptocurrency not found" });
      }
      
      // Check if user has enough balance
      if (parseFloat(sourceAccount.balance) < purchaseAmount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      
      // Calculate crypto amount based on exchange rate
      const cryptoRate = parseFloat(crypto.usdRate);
      const cryptoAmount = (purchaseAmount / cryptoRate).toFixed(8);
      
      // Check if user already has a crypto account for this currency
      let cryptoAccount = (await storage.getUserCryptoAccounts(req.session.userId))
        .find(account => account.currency === cryptoSymbol);
      
      // If not, create one
      if (!cryptoAccount) {
        cryptoAccount = await storage.createCryptoAccount({
          userId: req.session.userId,
          accountName: `${cryptoSymbol} Account`,
          accountNumber: `CRYPTO-${nanoid(8).toUpperCase()}`,
          accountType: "crypto",
          balance: "0",
          currency: cryptoSymbol,
          isCrypto: true
        });
      }
      
      // Generate reference
      const reference = `CRYPTO-${nanoid(8).toUpperCase()}`;
      
      // Create withdrawal transaction from source account
      const withdrawalTx = await storage.createTransaction({
        accountId: sourceAccount.id,
        amount: purchaseAmount.toString(),
        type: "crypto_purchase",
        description: `Purchase of ${cryptoAmount} ${cryptoSymbol}`,
        reference,
        status: "completed",
        receiverAccount: cryptoAccount.accountNumber,
        currency: sourceAccount.currency,
        targetCurrency: cryptoSymbol,
        exchangeRate: cryptoRate.toString()
      });
      
      // Create deposit transaction to crypto account
      const depositTx = await storage.createTransaction({
        accountId: cryptoAccount.id,
        amount: cryptoAmount,
        type: "crypto_purchase",
        description: `Purchased with ${purchaseAmount} ${sourceAccount.currency}`,
        reference,
        status: "completed",
        senderAccount: sourceAccount.accountNumber,
        currency: cryptoSymbol,
        targetCurrency: sourceAccount.currency,
        exchangeRate: (1 / cryptoRate).toString()
      });
      
      // Update account balances
      await storage.updateAccountBalance(sourceAccount.id, -purchaseAmount);
      await storage.updateAccountBalance(cryptoAccount.id, parseFloat(cryptoAmount));
      
      res.status(201).json({ 
        message: "Cryptocurrency purchase completed successfully", 
        reference,
        cryptoAmount,
        usdAmount: purchaseAmount,
        cryptoAccount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during cryptocurrency purchase" });
    }
  });

  // Crypto Exchange
  app.post("/api/crypto/exchange", requireAuth, async (req, res) => {
    try {
      const validatedData = cryptoExchangeSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { fromAccountId, toSymbol, amount } = validatedData.data;
      const exchangeAmount = parseFloat(amount);
      
      if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccount(fromAccountId);
      if (!sourceAccount || !sourceAccount.isCrypto) {
        return res.status(404).json({ message: "Source crypto account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if source has enough balance
      if (parseFloat(sourceAccount.balance) < exchangeAmount) {
        return res.status(400).json({ message: "Insufficient crypto funds" });
      }
      
      // Get source and target crypto details
      const sourceCrypto = await storage.getCryptocurrencyBySymbol(sourceAccount.currency);
      const targetCrypto = await storage.getCryptocurrencyBySymbol(toSymbol);
      
      if (!sourceCrypto || !targetCrypto) {
        return res.status(404).json({ message: "Cryptocurrency not found" });
      }
      
      // Calculate exchange rates and amounts
      const sourceUsdValue = exchangeAmount * parseFloat(sourceCrypto.usdRate);
      const targetAmount = (sourceUsdValue / parseFloat(targetCrypto.usdRate)).toFixed(8);
      
      // Check if user already has a target crypto account
      let targetAccount = (await storage.getUserCryptoAccounts(req.session.userId))
        .find(account => account.currency === toSymbol);
      
      // If not, create one
      if (!targetAccount) {
        targetAccount = await storage.createCryptoAccount({
          userId: req.session.userId,
          accountName: `${toSymbol} Account`,
          accountNumber: `CRYPTO-${nanoid(8).toUpperCase()}`,
          accountType: "crypto",
          balance: "0",
          currency: toSymbol,
          isCrypto: true
        });
      }
      
      // Generate reference
      const reference = `CRYPTO-EX-${nanoid(8).toUpperCase()}`;
      
      // Create withdrawal transaction from source account
      const withdrawalTx = await storage.createTransaction({
        accountId: sourceAccount.id,
        amount: exchangeAmount.toString(),
        type: "crypto_exchange",
        description: `Exchange to ${targetAmount} ${toSymbol}`,
        reference,
        status: "completed",
        receiverAccount: targetAccount.accountNumber,
        currency: sourceAccount.currency,
        targetCurrency: toSymbol,
        exchangeRate: (parseFloat(targetCrypto.usdRate) / parseFloat(sourceCrypto.usdRate)).toString()
      });
      
      // Create deposit transaction to target account
      const depositTx = await storage.createTransaction({
        accountId: targetAccount.id,
        amount: targetAmount,
        type: "crypto_exchange",
        description: `Exchanged from ${exchangeAmount} ${sourceAccount.currency}`,
        reference,
        status: "completed",
        senderAccount: sourceAccount.accountNumber,
        currency: toSymbol,
        targetCurrency: sourceAccount.currency,
        exchangeRate: (parseFloat(sourceCrypto.usdRate) / parseFloat(targetCrypto.usdRate)).toString()
      });
      
      // Update account balances
      await storage.updateAccountBalance(sourceAccount.id, -exchangeAmount);
      await storage.updateAccountBalance(targetAccount.id, parseFloat(targetAmount));
      
      res.status(201).json({ 
        message: "Cryptocurrency exchange completed successfully", 
        reference,
        sourceAmount: exchangeAmount,
        sourceCurrency: sourceAccount.currency,
        targetAmount,
        targetCurrency: toSymbol,
        usdValueExchanged: sourceUsdValue
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during cryptocurrency exchange" });
    }
  });

  // Crypto Transfer Request (External)
  app.post("/api/crypto/transfer-requests", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCryptoTransferRequestSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      const { fromAccountId, amount, externalAddress } = validatedData.data;
      const transferAmount = parseFloat(amount);
      
      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccount(fromAccountId);
      if (!sourceAccount || !sourceAccount.isCrypto) {
        return res.status(404).json({ message: "Source crypto account not found" });
      }
      
      // Check if the source account belongs to the current user
      if (sourceAccount.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if source has enough balance
      if (parseFloat(sourceAccount.balance) < transferAmount) {
        return res.status(400).json({ message: "Insufficient crypto funds" });
      }
      
      // Get crypto details for USD conversion
      const crypto = await storage.getCryptocurrencyBySymbol(sourceAccount.currency);
      if (!crypto) {
        return res.status(404).json({ message: "Cryptocurrency not found" });
      }
      
      // Calculate USD value
      const usdValue = (transferAmount * parseFloat(crypto.usdRate)).toFixed(2);
      
      // Determine fees (0.1% for external transfers)
      const feePercentage = 0.001;
      const feeAmount = (transferAmount * feePercentage).toFixed(8);
      const totalAmount = (transferAmount - parseFloat(feeAmount)).toFixed(8);
      
      // Create transfer request
      const transferRequest = await storage.createCryptoTransferRequest({
        type: "external_transfer",
        userId: req.session.userId,
        amount: transferAmount.toString(),
        description: `External transfer to ${externalAddress}`,
        targetCurrency: sourceAccount.currency,
        sourceCurrency: sourceAccount.currency,
        fromAccountId,
        totalAmount,
        fees: feeAmount,
        totalInUSD: usdValue,
        exchangeRate: crypto.usdRate,
        externalAddress
      });
      
      res.status(201).json({ 
        message: "Cryptocurrency transfer request submitted for approval", 
        transferRequest
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during cryptocurrency transfer request" });
    }
  });

  // Get Crypto Transfer Requests
  app.get("/api/crypto/transfer-requests", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let transferRequests;
      if (user.role === "admin") {
        // Admin can see all pending requests
        transferRequests = await storage.getPendingCryptoTransferRequests();
      } else {
        // Regular users can only see their own requests
        transferRequests = await storage.getUserCryptoTransferRequests(userId);
      }
      
      res.json(transferRequests);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching crypto transfer requests" });
    }
  });

  // Approve Crypto Transfer Request (Admin only)
  app.post("/api/crypto/transfer-requests/:id/approve", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin rights required." });
      }
      
      // Validate request data
      const validatedData = approveCryptoTransferSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validatedData.error.errors 
        });
      }
      
      // Get the transfer request
      const transferRequest = await storage.getCryptoTransferRequest(requestId);
      if (!transferRequest) {
        return res.status(404).json({ message: "Transfer request not found" });
      }
      
      // Check if request is already processed
      if (transferRequest.status !== "pending") {
        return res.status(400).json({ 
          message: `Cannot approve transfer request with status: ${transferRequest.status}` 
        });
      }
      
      // Get source account
      const sourceAccount = await storage.getAccount(transferRequest.fromAccountId);
      if (!sourceAccount) {
        return res.status(404).json({ message: "Source account not found" });
      }
      
      // Check if there is enough balance
      const transferAmount = parseFloat(transferRequest.amount);
      if (parseFloat(sourceAccount.balance) < transferAmount) {
        return res.status(400).json({ message: "Insufficient funds in source account" });
      }
      
      // Approve the transfer request
      const approvedRequest = await storage.approveCryptoTransferRequest(requestId, userId);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        accountId: transferRequest.fromAccountId,
        amount: transferAmount.toString(),
        type: "crypto_withdrawal",
        description: transferRequest.description,
        reference: `CRYPTO-TX-${requestId}`,
        status: "completed",
        receiverAccount: transferRequest.externalAddress || "External Wallet",
        currency: sourceAccount.currency,
        targetCurrency: transferRequest.targetCurrency,
        exchangeRate: transferRequest.exchangeRate || null,
        isApproved: true,
        approvedById: userId,
        approvedAt: new Date()
      });
      
      // Update account balance
      await storage.updateAccountBalance(sourceAccount.id, -transferAmount);
      
      // Complete the transfer request
      const completedRequest = await storage.completeCryptoTransferRequest(requestId);
      
      res.status(200).json({ 
        message: "Cryptocurrency transfer approved and completed", 
        transferRequest: completedRequest
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during crypto transfer approval" });
    }
  });

  // Reject Crypto Transfer Request (Admin only)
  app.post("/api/crypto/transfer-requests/:id/reject", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin rights required." });
      }
      
      // Get rejection reason
      const { rejectionReason } = req.body;
      if (!rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      // Get the transfer request
      const transferRequest = await storage.getCryptoTransferRequest(requestId);
      if (!transferRequest) {
        return res.status(404).json({ message: "Transfer request not found" });
      }
      
      // Check if request is already processed
      if (transferRequest.status !== "pending") {
        return res.status(400).json({ 
          message: `Cannot reject transfer request with status: ${transferRequest.status}` 
        });
      }
      
      // Reject the transfer request
      const rejectedRequest = await storage.rejectCryptoTransferRequest(requestId, userId, rejectionReason);
      
      res.status(200).json({ 
        message: "Cryptocurrency transfer request rejected", 
        transferRequest: rejectedRequest
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during crypto transfer rejection" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
