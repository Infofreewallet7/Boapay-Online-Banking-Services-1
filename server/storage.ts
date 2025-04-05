import { 
  users, accounts, transactions, bills, billPayments, externalBankAccounts, internationalTransfers,
  type User, type InsertUser, 
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Bill, type InsertBill,
  type BillPaymentType, type InsertBillPayment,
  type ExternalBankAccount, type InsertExternalBankAccount,
  type InternationalTransferType, type InsertInternationalTransfer
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
  
  // External Bank Account methods
  getExternalBankAccount(id: number): Promise<ExternalBankAccount | undefined>;
  getUserExternalBankAccounts(userId: number): Promise<ExternalBankAccount[]>;
  createExternalBankAccount(account: InsertExternalBankAccount): Promise<ExternalBankAccount>;
  updateExternalBankAccount(id: number, account: Partial<InsertExternalBankAccount>): Promise<ExternalBankAccount | undefined>;
  deleteExternalBankAccount(id: number): Promise<boolean>;
  
  // International Transfer methods
  getInternationalTransfer(id: number): Promise<InternationalTransferType | undefined>;
  getUserInternationalTransfers(userId: number): Promise<InternationalTransferType[]>;
  getAccountInternationalTransfers(accountId: number): Promise<InternationalTransferType[]>;
  createInternationalTransfer(transfer: InsertInternationalTransfer): Promise<InternationalTransferType>;
  updateInternationalTransferStatus(id: number, status: string, failureReason?: string): Promise<InternationalTransferType | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private bills: Map<number, Bill>;
  private billPayments: Map<number, BillPaymentType>;
  private externalBankAccounts: Map<number, ExternalBankAccount>;
  private internationalTransfers: Map<number, InternationalTransferType>;
  
  currentUserId: number;
  currentAccountId: number;
  currentTransactionId: number;
  currentBillId: number;
  currentBillPaymentId: number;
  currentExternalBankAccountId: number;
  currentInternationalTransferId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.bills = new Map();
    this.billPayments = new Map();
    this.externalBankAccounts = new Map();
    this.internationalTransfers = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentBillId = 1;
    this.currentBillPaymentId = 1;
    this.currentExternalBankAccountId = 1;
    this.currentInternationalTransferId = 1;
    
    // Initialize with some dummy data
    // We're calling an async method from a sync constructor
    // This is not ideal, but works for our demo purposes
    this.initializeDummyData().catch(err => console.error("Error initializing dummy data:", err));
  }

  // Initialize with some dummy data
  private async initializeDummyData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
    };
    
    const user = await this.createUser(demoUser);
    
    // Create checking account
    const checkingAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "1000123456",
      accountName: "Premium Checking",
      accountType: "checking",
      balance: "5000.00",
      currency: "USD",
    };
    
    // Create savings account
    const savingsAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "2000123456",
      accountName: "High-Yield Savings",
      accountType: "savings",
      balance: "15000.00",
      currency: "USD",
    };
    
    // Create euro account
    const euroAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "3000123456",
      accountName: "Euro Account",
      accountType: "checking",
      balance: "3000.00",
      currency: "EUR",
    };
    
    const checking = await this.createAccount(checkingAccount);
    const savings = await this.createAccount(savingsAccount);
    const euro = await this.createAccount(euroAccount);
    
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
      },
      // Euro account transactions
      {
        accountId: euro.id,
        amount: "500.00",
        type: "deposit",
        description: "Initial Deposit",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
      },
      {
        accountId: euro.id,
        amount: "200.00",
        type: "deposit",
        description: "International Transfer from USD Account",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
        senderAccount: checking.accountNumber,
      },
      {
        accountId: euro.id,
        amount: "150.00",
        type: "withdrawal",
        description: "European Vendor Payment",
        reference: `TRX${nanoid(8).toUpperCase()}`,
        status: "completed",
      }
    ];
    
    // Create transactions one by one with await
    for (const tx of transactions) {
      await this.createTransaction(tx);
    }
    
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
    
    // Create bills one by one with await
    for (const bill of bills) {
      await this.createBill(bill);
    }
    
    // Create some external bank accounts
    const externalAccounts: InsertExternalBankAccount[] = [
      {
        userId: user.id,
        accountName: "Jane Smith",
        accountNumber: "GB29NWBK60161331926819",
        bankName: "Barclays",
        swiftCode: "BARCGB22XXX",
        routingNumber: "026002561",
        iban: "GB29NWBK60161331926819",
        country: "United Kingdom",
        currency: "GBP",
        accountType: "checking",
        isActive: true,
        memo: "Family account in London",
      },
      {
        userId: user.id,
        accountName: "Carlos Rodriguez",
        accountNumber: "ES9121000418450200051332",
        bankName: "Santander",
        swiftCode: "BSCHESMMXXX",
        iban: "ES9121000418450200051332",
        country: "Spain",
        currency: "EUR",
        accountType: "savings",
        isActive: true,
        memo: "Business partner in Madrid",
      }
    ];
    
    // Create external accounts one by one with await
    for (const account of externalAccounts) {
      await this.createExternalBankAccount(account);
    }
    
    // Create a sample international transfer
    const sampleTransfer: InsertInternationalTransfer = {
      sourceAccountId: checking.id,
      externalAccountId: 1, // The Barclays account
      amount: "500.00",
      exchangeRate: "0.79",
      sourceCurrency: "USD",
      targetCurrency: "GBP",
      fees: "25.00",
      totalDebit: "525.00",
      reference: `ITR${nanoid(8).toUpperCase()}`,
      purposeOfTransfer: "Family Support",
      status: "completed",
      estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    };
    
    await this.createInternationalTransfer(sampleTransfer);
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
    // Ensure currency field is present, defaulting to USD if not provided
    const account: Account = { 
      ...insertAccount, 
      id, 
      currency: insertAccount.currency || "USD",
      balance: insertAccount.balance || "0", 
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
      receiverAccount: insertTransaction.receiverAccount || null,
      senderAccount: insertTransaction.senderAccount || null,
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
      dueDate: insertBill.dueDate || null,
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
  
  // External Bank Account methods
  async getExternalBankAccount(id: number): Promise<ExternalBankAccount | undefined> {
    return this.externalBankAccounts.get(id);
  }
  
  async getUserExternalBankAccounts(userId: number): Promise<ExternalBankAccount[]> {
    return Array.from(this.externalBankAccounts.values())
      .filter((account) => account.userId === userId)
      .sort((a, b) => a.accountName.localeCompare(b.accountName));
  }
  
  async createExternalBankAccount(insertAccount: InsertExternalBankAccount): Promise<ExternalBankAccount> {
    const id = this.currentExternalBankAccountId++;
    const account: ExternalBankAccount = {
      ...insertAccount,
      id,
      createdAt: new Date(),
      isActive: insertAccount.isActive !== undefined ? insertAccount.isActive : true,
      accountType: insertAccount.accountType || "checking",
      routingNumber: insertAccount.routingNumber || null,
      iban: insertAccount.iban || null,
      memo: insertAccount.memo || null
    };
    this.externalBankAccounts.set(id, account);
    return account;
  }
  
  async updateExternalBankAccount(id: number, accountUpdate: Partial<InsertExternalBankAccount>): Promise<ExternalBankAccount | undefined> {
    const account = this.externalBankAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount: ExternalBankAccount = {
      ...account,
      ...accountUpdate,
    };
    
    this.externalBankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteExternalBankAccount(id: number): Promise<boolean> {
    if (!this.externalBankAccounts.has(id)) return false;
    return this.externalBankAccounts.delete(id);
  }
  
  // International Transfer methods
  async getInternationalTransfer(id: number): Promise<InternationalTransferType | undefined> {
    return this.internationalTransfers.get(id);
  }
  
  async getUserInternationalTransfers(userId: number): Promise<InternationalTransferType[]> {
    const userAccounts = await this.getUserAccounts(userId);
    const accountIds = userAccounts.map(account => account.id);
    
    return Array.from(this.internationalTransfers.values())
      .filter((transfer) => accountIds.includes(transfer.sourceAccountId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAccountInternationalTransfers(accountId: number): Promise<InternationalTransferType[]> {
    return Array.from(this.internationalTransfers.values())
      .filter((transfer) => transfer.sourceAccountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createInternationalTransfer(insertTransfer: InsertInternationalTransfer): Promise<InternationalTransferType> {
    const id = this.currentInternationalTransferId++;
    
    // Calculate total debit if not provided
    const totalDebit = insertTransfer.totalDebit || 
      (parseFloat(insertTransfer.amount) + parseFloat(insertTransfer.fees?.toString() || "0")).toString();
    
    const transfer: InternationalTransferType = {
      ...insertTransfer,
      id,
      totalDebit,
      createdAt: new Date(),
      completedAt: null,
      failureReason: null,
      exchangeRate: insertTransfer.exchangeRate || null,
      fees: insertTransfer.fees || "0",
      purposeOfTransfer: insertTransfer.purposeOfTransfer || null,
      estimatedDelivery: insertTransfer.estimatedDelivery || null,
    };
    
    this.internationalTransfers.set(id, transfer);
    return transfer;
  }
  
  async updateInternationalTransferStatus(id: number, status: string, failureReason?: string): Promise<InternationalTransferType | undefined> {
    const transfer = this.internationalTransfers.get(id);
    if (!transfer) return undefined;
    
    const updatedTransfer: InternationalTransferType = {
      ...transfer,
      status,
      completedAt: status === 'completed' ? new Date() : transfer.completedAt,
      failureReason: failureReason || transfer.failureReason,
    };
    
    this.internationalTransfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
}

export const storage = new MemStorage();
