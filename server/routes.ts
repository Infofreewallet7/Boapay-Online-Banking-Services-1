import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { loginUserSchema, insertUserSchema, transferFundsSchema, billPaymentSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
