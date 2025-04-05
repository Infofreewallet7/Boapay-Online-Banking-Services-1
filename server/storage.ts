import { 
  users, accounts, transactions, bills, billPayments,
  type User, type InsertUser, 
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Bill, type InsertBill,
  type BillPaymentType, type InsertBillPayment
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account methods
  getAccount(id: number): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  getUserAccounts(userId: number): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(id: number, amount: number): Promise<Account | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAccountTransactions(accountId: number): Promise<Transaction[]>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Bill methods
  getBill(id: number): Promise<Bill | undefined>;
  getUserBills(userId: number): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBillStatus(id: number, status: string): Promise<Bill | undefined>;
  
  // Bill Payment methods
  getBillPayment(id: number): Promise<BillPaymentType | undefined>;
  getBillPayments(billId: number): Promise<BillPaymentType[]>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPaymentType>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private bills: Map<number, Bill>;
  private billPayments: Map<number, BillPaymentType>;
  
  currentUserId: number;
  currentAccountId: number;
  currentTransactionId: number;
  currentBillId: number;
  currentBillPaymentId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.bills = new Map();
    this.billPayments = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentBillId = 1;
    this.currentBillPaymentId = 1;
    
    // Initialize with some dummy data
    this.initializeDummyData();
  }

  // Initialize with some dummy data
  private initializeDummyData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
    };
    
    const user = this.createUser(demoUser);
    
    // Create checking account
    const checkingAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "1000123456",
      accountName: "Premium Checking",
      accountType: "checking",
      balance: "5000.00",
    };
    
    // Create savings account
    const savingsAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "2000123456",
      accountName: "High-Yield Savings",
      accountType: "savings",
      balance: "15000.00",
    };
    
    const checking = this.createAccount(checkingAccount);
    const savings = this.createAccount(savingsAccount);
    
    // Create some transactions
    const transactions: InsertTransaction[] = [
      {
        accountId: checking.id,
        amount: "750.00",
        type: "deposit",
        description: "Payroll Deposit",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
        senderAccount: "Employer Inc.",
      },
      {
        accountId: checking.id,
        amount: "125.50",
        type: "withdrawal",
        description: "ATM Withdrawal",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
      },
      {
        accountId: savings.id,
        amount: "1000.00",
        type: "deposit",
        description: "Transfer from Checking",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
        senderAccount: checking.accountNumber,
      },
      {
        accountId: checking.id,
        amount: "1000.00",
        type: "withdrawal",
        description: "Transfer to Savings",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
        receiverAccount: savings.accountNumber,
      },
      {
        accountId: checking.id,
        amount: "85.75",
        type: "withdrawal",
        description: "Online Purchase - Amazon",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
      }
    ];
    
    transactions.forEach(tx => this.createTransaction(tx));
    
    // Create some bills
    const bills: InsertBill[] = [
      {
        userId: user.id,
        billName: "Electricity Bill",
        billCategory: "utility",
        paymentAmount: "85.50",
        accountNumber: "UTIL-1234567",
        billReference: `BILL${nanoid(8).toUpperCase()}`,
        status: "pending",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        userId: user.id,
        billName: "Internet Service",
        billCategory: "utility",
        paymentAmount: "65.99",
        accountNumber: "ISP-9876543",
        billReference: `BILL${nanoid(8).toUpperCase()}`,
        status: "pending",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        userId: user.id,
        billName: "Netflix Subscription",
        billCategory: "subscription",
        paymentAmount: "14.99",
        accountNumber: "SUB-5678123",
        billReference: `BILL${nanoid(8).toUpperCase()}`,
        status: "paid",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
    ];
    
    bills.forEach(bill => this.createBill(bill));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isVerified: false };
    this.users.set(id, user);
    return user;
  }
  
  // Account methods
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.accountNumber === accountNumber,
    );
  }
  
  async getUserAccounts(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId,
    );
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = { 
      ...insertAccount, 
      id, 
      createdAt: new Date() 
    };
    this.accounts.set(id, account);
    return account;
  }
  
  async updateAccountBalance(id: number, amount: number): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount: Account = {
      ...account,
      balance: (parseFloat(account.balance.toString()) + amount).toFixed(2),
    };
    
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getAccountTransactions(accountId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.accountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const userAccounts = await this.getUserAccounts(userId);
    const accountIds = userAccounts.map(account => account.id);
    
    return Array.from(this.transactions.values())
      .filter((transaction) => accountIds.includes(transaction.accountId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Bill methods
  async getBill(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }
  
  async getUserBills(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values())
      .filter((bill) => bill.userId === userId)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        return 0;
      });
  }
  
  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.currentBillId++;
    const bill: Bill = {
      ...insertBill,
      id,
      createdAt: new Date(),
    };
    this.bills.set(id, bill);
    return bill;
  }
  
  async updateBillStatus(id: number, status: string): Promise<Bill | undefined> {
    const bill = this.bills.get(id);
    if (!bill) return undefined;
    
    const updatedBill: Bill = {
      ...bill,
      status,
    };
    
    this.bills.set(id, updatedBill);
    return updatedBill;
  }
  
  // Bill Payment methods
  async getBillPayment(id: number): Promise<BillPaymentType | undefined> {
    return this.billPayments.get(id);
  }
  
  async getBillPayments(billId: number): Promise<BillPaymentType[]> {
    return Array.from(this.billPayments.values())
      .filter((payment) => payment.billId === billId)
      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
  }
  
  async createBillPayment(insertPayment: InsertBillPayment): Promise<BillPaymentType> {
    const id = this.currentBillPaymentId++;
    const payment: BillPaymentType = {
      ...insertPayment,
      id,
      paymentDate: new Date(),
    };
    this.billPayments.set(id, payment);
    return payment;
  }
}

export const storage = new MemStorage();
