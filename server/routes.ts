import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { 
  loginUserSchema, 
  insertUserSchema, 
  transferFundsSchema, 
  billPaymentSchema,
  insertExternalBankAccountSchema,
  internationalTransferSchema
} from "@shared/schema";
import { 
  getCurrencyInfo, 
  getTransferConversionDetails, 
  Currency
} from "./services/currencyService";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create session store
  const SessionStore = MemoryStore(session);
  
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "boapay-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
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
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
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
      const accounts = await storage.getUserAccounts(req.session.userId as number);
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
      const transactions = await storage.getUserTransactions(req.session.userId as number);
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
      const bills = await storage.getUserBills(req.session.userId as number);
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
      const accounts = await storage.getUserExternalBankAccounts(req.session.userId as number);
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
        userId: req.session.userId as number,
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
      const transfers = await storage.getUserInternationalTransfers(req.session.userId as number);
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

  const httpServer = createServer(app);
  return httpServer;
}
