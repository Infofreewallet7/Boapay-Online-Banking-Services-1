import { 
  users, accounts, transactions, bills, billPayments, externalBankAccounts, internationalTransfers, transferRequests,
  loans, loanApplications, cryptocurrencies, cryptoTransferRequests,
  type User, type InsertUser, 
  type Account, type InsertAccount,
  type Transaction, type InsertTransaction,
  type Bill, type InsertBill,
  type BillPaymentType, type InsertBillPayment,
  type ExternalBankAccount, type InsertExternalBankAccount,
  type InternationalTransferType, type InsertInternationalTransfer,
  type TransferRequestType, type InsertTransferRequest,
  type LoanType, type InsertLoan,
  type LoanApplicationType, type InsertLoanApplication,
  type CryptocurrencyType, type InsertCryptocurrency,
  type CryptoTransferRequestType, type InsertCryptoTransferRequest
} from "@shared/schema";
import { nanoid } from "nanoid";

import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(id: number, verificationCode: string): Promise<User | undefined>;
  setUserVerificationCode(id: number, code: string): Promise<User | undefined>;
  approveUser(id: number, approvedById: number): Promise<User | undefined>;
  getAdmins(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
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
  approveInternationalTransfer(id: number, approvedById: number): Promise<InternationalTransferType | undefined>;
  
  // Transfer Request methods
  getTransferRequest(id: number): Promise<TransferRequestType | undefined>;
  getUserTransferRequests(userId: number): Promise<TransferRequestType[]>;
  getPendingTransferRequests(): Promise<TransferRequestType[]>;
  createTransferRequest(request: InsertTransferRequest): Promise<TransferRequestType>;
  approveTransferRequest(id: number, approvedById: number): Promise<TransferRequestType | undefined>;
  rejectTransferRequest(id: number, approvedById: number, rejectionReason: string): Promise<TransferRequestType | undefined>;
  completeTransferRequest(id: number): Promise<TransferRequestType | undefined>;
  
  // Loan methods
  getLoan(id: number): Promise<LoanType | undefined>;
  getAllLoans(): Promise<LoanType[]>;
  createLoan(loan: InsertLoan): Promise<LoanType>;
  
  // Loan Application methods
  getLoanApplication(id: number): Promise<LoanApplicationType | undefined>;
  getUserLoanApplications(userId: number): Promise<LoanApplicationType[]>;
  getPendingLoanApplications(): Promise<LoanApplicationType[]>;
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplicationType>;
  approveLoanApplication(id: number, approvedById: number, approvedAmount: number, approvedTermMonths: number, approvedInterestRate: number): Promise<LoanApplicationType | undefined>;
  rejectLoanApplication(id: number, approvedById: number, rejectionReason: string): Promise<LoanApplicationType | undefined>;
  
  // Cryptocurrency methods
  getCryptocurrency(id: number): Promise<CryptocurrencyType | undefined>;
  getCryptocurrencyByCode(code: string): Promise<CryptocurrencyType | undefined>;
  getAllCryptocurrencies(): Promise<CryptocurrencyType[]>;
  getAvailableCryptocurrencies(): Promise<CryptocurrencyType[]>;
  createCryptocurrency(crypto: InsertCryptocurrency): Promise<CryptocurrencyType>;
  updateCryptocurrencyRates(id: number, usdRate: string, eurRate: string): Promise<CryptocurrencyType | undefined>;
  
  // Crypto Transfer Request methods
  getCryptoTransferRequest(id: number): Promise<CryptoTransferRequestType | undefined>;
  getUserCryptoTransferRequests(userId: number): Promise<CryptoTransferRequestType[]>;
  getPendingCryptoTransferRequests(): Promise<CryptoTransferRequestType[]>;
  createCryptoTransferRequest(request: InsertCryptoTransferRequest): Promise<CryptoTransferRequestType>;
  approveCryptoTransferRequest(id: number, approvedById: number): Promise<CryptoTransferRequestType | undefined>;
  rejectCryptoTransferRequest(id: number, approvedById: number, rejectionReason: string): Promise<CryptoTransferRequestType | undefined>;
  completeCryptoTransferRequest(id: number): Promise<CryptoTransferRequestType | undefined>;
  
  // Crypto Account methods
  getUserCryptoAccounts(userId: number): Promise<Account[]>;
  createCryptoAccount(account: InsertAccount): Promise<Account>;
  
  // Transaction Categorization methods
  updateTransactionCategory(id: number, category: string, subcategory?: string, tags?: string[], notes?: string): Promise<Transaction | undefined>;
  getTransactionCategories(): Promise<string[]>;
  getTransactionSubcategories(category: string): Promise<string[]>;
}

import MemoryStore from "memorystore";

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private transactions: Map<number, Transaction>;
  private bills: Map<number, Bill>;
  private billPayments: Map<number, BillPaymentType>;
  private externalBankAccounts: Map<number, ExternalBankAccount>;
  private internationalTransfers: Map<number, InternationalTransferType>;
  private transferRequests: Map<number, TransferRequestType>;
  private loans: Map<number, LoanType>;
  private loanApplications: Map<number, LoanApplicationType>;
  private cryptocurrencies: Map<number, CryptocurrencyType>;
  private cryptoTransferRequests: Map<number, CryptoTransferRequestType>;
  
  currentUserId: number;
  currentAccountId: number;
  currentTransactionId: number;
  currentBillId: number;
  currentBillPaymentId: number;
  currentExternalBankAccountId: number;
  currentInternationalTransferId: number;
  currentTransferRequestId: number;
  currentLoanId: number;
  currentLoanApplicationId: number;
  currentCryptocurrencyId: number;
  currentCryptoTransferRequestId: number;

  constructor() {
    // Create memory store for sessions
    const MemStore = MemoryStore(session);
    this.sessionStore = new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    this.users = new Map();
    this.accounts = new Map();
    this.transactions = new Map();
    this.bills = new Map();
    this.billPayments = new Map();
    this.externalBankAccounts = new Map();
    this.internationalTransfers = new Map();
    this.transferRequests = new Map();
    this.loans = new Map();
    this.loanApplications = new Map();
    this.cryptocurrencies = new Map();
    this.cryptoTransferRequests = new Map();
    
    this.currentUserId = 1;
    this.currentAccountId = 1;
    this.currentTransactionId = 1;
    this.currentBillId = 1;
    this.currentBillPaymentId = 1;
    this.currentExternalBankAccountId = 1;
    this.currentInternationalTransferId = 1;
    this.currentTransferRequestId = 1;
    this.currentLoanId = 1;
    this.currentLoanApplicationId = 1;
    this.currentCryptocurrencyId = 1;
    this.currentCryptoTransferRequestId = 1;
    
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
    
    // Create sample loan types
    const loanTypes: InsertLoan[] = [
      {
        name: "Personal Loan",
        loanType: "personal",
        minAmount: "2000.00",
        maxAmount: "8000.00",
        interestRate: "8.99",
        termMonths: 36,
        requiresApproval: false,
        description: "Low-interest personal loans for various needs with flexible repayment terms.",
        eligibilityRequirements: "Minimum credit score of 650, stable income, and debt-to-income ratio below 40%."
      },
      {
        name: "Overdraft Protection",
        loanType: "overdraft",
        minAmount: "100.00",
        maxAmount: "4000.00",
        interestRate: "15.99",
        termMonths: 12,
        requiresApproval: false,
        description: "Protection against overdrawing your account with instant access to funds.",
        eligibilityRequirements: "Active checking account for at least 3 months with regular deposits."
      },
      {
        name: "Business Expansion Loan",
        loanType: "business",
        minAmount: "10000.00",
        maxAmount: "1000000.00",
        interestRate: "6.75",
        termMonths: 60,
        requiresApproval: true,
        description: "Finance your business growth with competitive rates and flexible terms.",
        eligibilityRequirements: "Business must be operating for at least 2 years with positive cash flow."
      },
      {
        name: "Emergency Loan",
        loanType: "emergency",
        minAmount: "500.00",
        maxAmount: "5000.00",
        interestRate: "10.50",
        termMonths: 24,
        requiresApproval: false,
        description: "Quick access to funds for unexpected expenses with easy application process.",
        eligibilityRequirements: "Credit score of 600+ and proof of income."
      },
      {
        name: "Home Improvement Loan",
        loanType: "large_purchase",
        minAmount: "5000.00",
        maxAmount: "50000.00",
        interestRate: "7.25",
        termMonths: 84,
        requiresApproval: true,
        description: "Renovate or repair your home with affordable financing options.",
        eligibilityRequirements: "Home ownership, credit score of 680+, and debt-to-income ratio below 35%."
      },
      {
        name: "Student Loan",
        loanType: "student",
        minAmount: "1000.00",
        maxAmount: "30000.00",
        interestRate: "5.50",
        termMonths: 120,
        requiresApproval: true,
        description: "Invest in your future with education financing at competitive rates.",
        eligibilityRequirements: "Enrollment in accredited institution, satisfactory academic progress."
      },
      {
        name: "Premium Credit Line",
        loanType: "credit",
        minAmount: "1000.00",
        maxAmount: "30000.00",
        interestRate: "12.99",
        termMonths: 0, // Revolving credit
        requiresApproval: true,
        description: "Flexible credit line for all your needs with competitive interest rates.",
        eligibilityRequirements: "Credit score of 700+, stable income, and clean credit history."
      }
    ];
    
    // Create loan types
    for (const loan of loanTypes) {
      await this.createLoan(loan);
    }
    
    // Create cryptocurrencies
    const cryptos: InsertCryptocurrency[] = [
      {
        code: "BTC",
        symbol: "₿",
        name: "Bitcoin",
        usdRate: "50000.00000000",
        eurRate: "45000.00000000",
        currentPrice: "50000.00000000",
        available: true,
        minPurchaseAmount: "0.00100000",
        description: "The original cryptocurrency and the world's largest by market capitalization.",
        icon: "₿",
      },
      {
        code: "ETH",
        symbol: "Ξ",
        name: "Ethereum",
        usdRate: "3000.00000000",
        eurRate: "2700.00000000",
        currentPrice: "3000.00000000",
        available: true,
        minPurchaseAmount: "0.01000000",
        description: "A decentralized computing platform for smart contracts and DApps.",
        icon: "Ξ",
      },
      {
        code: "XRP",
        symbol: "✕",
        name: "Ripple",
        usdRate: "1.25000000",
        eurRate: "1.12500000",
        currentPrice: "1.25000000",
        available: true,
        minPurchaseAmount: "10.00000000",
        description: "Digital payment protocol and cryptocurrency for fast, low-cost international transfers.",
        icon: "✕",
      },
      {
        code: "LTC",
        symbol: "Ł",
        name: "Litecoin",
        usdRate: "180.00000000",
        eurRate: "162.00000000",
        currentPrice: "180.00000000",
        available: true,
        minPurchaseAmount: "0.10000000",
        description: "Peer-to-peer cryptocurrency designed for faster transaction confirmation times.",
        icon: "Ł",
      },
      {
        code: "SOL",
        symbol: "S",
        name: "Solana",
        usdRate: "100.00000000",
        eurRate: "90.00000000",
        currentPrice: "100.00000000",
        available: true,
        minPurchaseAmount: "0.10000000",
        description: "High-performance blockchain supporting smart contracts and decentralized applications.",
        icon: "S",
      }
    ];
    
    // Create cryptocurrencies
    for (const crypto of cryptos) {
      await this.createCryptocurrency(crypto);
    }
    
    // Create crypto accounts for the demo user
    const btcAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "BTC" + nanoid(8).toUpperCase(),
      accountName: "Bitcoin Wallet",
      accountType: "crypto",
      balance: "0.25000000",
      currency: "BTC",
      isCrypto: true
    };
    
    const ethAccount: InsertAccount = {
      userId: user.id,
      accountNumber: "ETH" + nanoid(8).toUpperCase(),
      accountName: "Ethereum Wallet",
      accountType: "crypto",
      balance: "5.00000000",
      currency: "ETH",
      isCrypto: true
    };
    
    // Create crypto accounts
    const btc = await this.createCryptoAccount(btcAccount);
    const eth = await this.createCryptoAccount(ethAccount);
    
    // Create crypto transactions
    const cryptoTransactions: InsertTransaction[] = [
      {
        accountId: btc.id,
        amount: "0.25000000",
        type: "crypto_purchase",
        description: "Bitcoin Purchase",
        reference: `CRYPTO${nanoid(8).toUpperCase()}`,
        status: "completed",
        currency: "BTC",
        exchangeRate: "48500.00000000",
        targetCurrency: "USD",
        fees: "0.00100000",
        isApproved: true
      },
      {
        accountId: eth.id,
        amount: "5.00000000",
        type: "crypto_purchase",
        description: "Ethereum Purchase",
        reference: `CRYPTO${nanoid(8).toUpperCase()}`,
        status: "completed",
        currency: "ETH",
        exchangeRate: "2950.00000000",
        targetCurrency: "USD",
        fees: "0.00500000",
        isApproved: true
      }
    ];
    
    // Create crypto transactions
    for (const tx of cryptoTransactions) {
      await this.createTransaction(tx);
    }
  }
  
  // Cryptocurrency methods
  async getCryptocurrency(id: number): Promise<CryptocurrencyType | undefined> {
    return this.cryptocurrencies.get(id);
  }
  
  async getCryptocurrencyByCode(code: string): Promise<CryptocurrencyType | undefined> {
    return Array.from(this.cryptocurrencies.values()).find(
      (crypto) => crypto.code === code
    );
  }
  
  async getCryptocurrencyBySymbol(symbol: string): Promise<CryptocurrencyType | undefined> {
    return Array.from(this.cryptocurrencies.values()).find(
      (crypto) => crypto.symbol === symbol
    );
  }
  
  async getAllCryptocurrencies(): Promise<CryptocurrencyType[]> {
    return Array.from(this.cryptocurrencies.values());
  }
  
  async getAvailableCryptocurrencies(): Promise<CryptocurrencyType[]> {
    return Array.from(this.cryptocurrencies.values()).filter(
      (crypto) => crypto.available
    );
  }
  
  async createCryptocurrency(insertCrypto: InsertCryptocurrency): Promise<CryptocurrencyType> {
    const id = this.currentCryptocurrencyId++;
    const crypto: CryptocurrencyType = {
      ...insertCrypto,
      id,
      updatedAt: new Date(),
      available: insertCrypto.available !== undefined ? insertCrypto.available : true,
      minPurchaseAmount: insertCrypto.minPurchaseAmount || "0.00000001",
      icon: insertCrypto.icon || null
    };
    this.cryptocurrencies.set(id, crypto);
    return crypto;
  }
  
  async updateCryptocurrencyRates(id: number, usdRate: string, eurRate: string): Promise<CryptocurrencyType | undefined> {
    const crypto = this.cryptocurrencies.get(id);
    if (!crypto) return undefined;
    
    const updatedCrypto: CryptocurrencyType = {
      ...crypto,
      usdRate,
      eurRate,
      currentPrice: usdRate,
      updatedAt: new Date()
    };
    
    this.cryptocurrencies.set(id, updatedCrypto);
    return updatedCrypto;
  }
  
  // Crypto Transfer Request methods
  async getCryptoTransferRequest(id: number): Promise<CryptoTransferRequestType | undefined> {
    return this.cryptoTransferRequests.get(id);
  }
  
  async getUserCryptoTransferRequests(userId: number): Promise<CryptoTransferRequestType[]> {
    return Array.from(this.cryptoTransferRequests.values())
      .filter((request) => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPendingCryptoTransferRequests(): Promise<CryptoTransferRequestType[]> {
    return Array.from(this.cryptoTransferRequests.values())
      .filter((request) => request.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createCryptoTransferRequest(insertRequest: InsertCryptoTransferRequest): Promise<CryptoTransferRequestType> {
    const id = this.currentCryptoTransferRequestId++;
    
    // Ensure all required fields are present
    if (!insertRequest.type) {
      insertRequest.type = "crypto_transfer";
    }
    
    if (!insertRequest.description) {
      insertRequest.description = `Transfer of ${insertRequest.amount} ${insertRequest.sourceCurrency}`;
    }
    
    if (!insertRequest.userId) {
      throw new Error("userId is required for crypto transfer request");
    }
    
    if (!insertRequest.fromAccountId) {
      throw new Error("fromAccountId is required for crypto transfer request");
    }
    
    if (!insertRequest.amount) {
      throw new Error("amount is required for crypto transfer request");
    }
    
    if (!insertRequest.sourceCurrency) {
      throw new Error("sourceCurrency is required for crypto transfer request");
    }
    
    if (!insertRequest.targetCurrency) {
      throw new Error("targetCurrency is required for crypto transfer request");
    }

    const request: CryptoTransferRequestType = {
      id,
      userId: insertRequest.userId,
      fromAccountId: insertRequest.fromAccountId,
      toAccountId: insertRequest.toAccountId || null,
      amount: insertRequest.amount,
      sourceCurrency: insertRequest.sourceCurrency,
      targetCurrency: insertRequest.targetCurrency,
      type: insertRequest.type,
      description: insertRequest.description,
      createdAt: new Date(),
      status: "pending",
      approvedAt: null,
      approvedById: null,
      completedAt: null,
      rejectionReason: null,
      exchangeRate: insertRequest.exchangeRate || null,
      fees: insertRequest.fees || "0",
      totalAmount: insertRequest.totalAmount || insertRequest.amount,
      totalInUSD: insertRequest.totalInUSD || "0",
      externalAddress: insertRequest.externalAddress || null,
      isExternal: insertRequest.isExternal !== undefined ? insertRequest.isExternal : true
    };
    
    this.cryptoTransferRequests.set(id, request);
    return request;
  }
  
  async approveCryptoTransferRequest(id: number, approvedById: number): Promise<CryptoTransferRequestType | undefined> {
    const request = this.cryptoTransferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: CryptoTransferRequestType = {
      ...request,
      status: "approved",
      approvedById,
      approvedAt: new Date()
    };
    
    this.cryptoTransferRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async rejectCryptoTransferRequest(id: number, approvedById: number, rejectionReason: string): Promise<CryptoTransferRequestType | undefined> {
    const request = this.cryptoTransferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: CryptoTransferRequestType = {
      ...request,
      status: "rejected",
      approvedById,
      rejectionReason
    };
    
    this.cryptoTransferRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async completeCryptoTransferRequest(id: number): Promise<CryptoTransferRequestType | undefined> {
    const request = this.cryptoTransferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: CryptoTransferRequestType = {
      ...request,
      status: "completed",
      completedAt: new Date()
    };
    
    this.cryptoTransferRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Crypto Account methods
  async getUserCryptoAccounts(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values()).filter(
      (account) => account.userId === userId && account.isCrypto
    );
  }
  
  async createCryptoAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const account: Account = {
      ...insertAccount,
      id,
      isCrypto: true,
      balance: insertAccount.balance || "0",
      currency: insertAccount.currency || "BTC",
      createdAt: new Date()
    };
    this.accounts.set(id, account);
    return account;
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
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      verificationCode: null,
      isApproved: false,
      role: "customer"
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async verifyUser(id: number, verificationCode: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user || user.verificationCode !== verificationCode) return undefined;
    
    const updatedUser: User = {
      ...user,
      isVerified: true,
      verificationCode: null
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async setUserVerificationCode(id: number, code: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      verificationCode: code
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async approveUser(id: number, approvedById: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      isApproved: true
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "admin"
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      role
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
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
      createdAt: new Date(),
      isCrypto: insertAccount.isCrypto || false
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
      currency: insertTransaction.currency || null,
      exchangeRate: insertTransaction.exchangeRate || null,
      targetCurrency: insertTransaction.targetCurrency || null,
      fees: insertTransaction.fees || null,
      isApproved: insertTransaction.isApproved !== undefined ? insertTransaction.isApproved : false,
      approvedById: insertTransaction.approvedById || null,
      approvedAt: insertTransaction.approvedAt || null,
      category: insertTransaction.category || null,
      subcategory: insertTransaction.subcategory || null,
      tags: insertTransaction.tags || [],
      notes: insertTransaction.notes || null
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
    
    const status = insertTransfer.status || "pending";
    
    const transfer: InternationalTransferType = {
      ...insertTransfer,
      id,
      totalDebit,
      createdAt: new Date(),
      completedAt: null,
      failureReason: null,
      exchangeRate: insertTransfer.exchangeRate || "1.0",
      fees: insertTransfer.fees || "0",
      purposeOfTransfer: insertTransfer.purposeOfTransfer || "",
      estimatedDelivery: insertTransfer.estimatedDelivery || null,
      isApproved: insertTransfer.isApproved || false,
      approvedById: insertTransfer.approvedById || null,
      approvedAt: insertTransfer.approvedAt || null,
      status: status,
      reference: insertTransfer.reference || `INTL-${id}`
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
  
  async approveInternationalTransfer(id: number, approvedById: number): Promise<InternationalTransferType | undefined> {
    const transfer = this.internationalTransfers.get(id);
    if (!transfer) return undefined;
    
    const updatedTransfer: InternationalTransferType = {
      ...transfer,
      status: 'approved',
      approvedById
    };
    
    this.internationalTransfers.set(id, updatedTransfer);
    return updatedTransfer;
  }
  
  // Transfer Request methods
  async getTransferRequest(id: number): Promise<TransferRequestType | undefined> {
    return this.transferRequests.get(id);
  }
  
  async getUserTransferRequests(userId: number): Promise<TransferRequestType[]> {
    return Array.from(this.transferRequests.values())
      .filter((request) => request.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getPendingTransferRequests(): Promise<TransferRequestType[]> {
    return Array.from(this.transferRequests.values())
      .filter((request) => request.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createTransferRequest(insertRequest: InsertTransferRequest): Promise<TransferRequestType> {
    const id = this.currentTransferRequestId++;
    
    const request: TransferRequestType = {
      ...insertRequest,
      id,
      createdAt: new Date(),
      status: 'pending',
      approvedAt: null,
      approvedById: null,
      rejectionReason: null,
      completedAt: null,
      currency: insertRequest.currency || "USD",
      toBankName: insertRequest.toBankName || null,
      isExternal: insertRequest.isExternal !== undefined ? insertRequest.isExternal : false
    };
    
    this.transferRequests.set(id, request);
    return request;
  }
  
  async approveTransferRequest(id: number, approvedById: number): Promise<TransferRequestType | undefined> {
    const request = this.transferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: TransferRequestType = {
      ...request,
      status: 'approved',
      approvedAt: new Date(),
      approvedById
    };
    
    this.transferRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async rejectTransferRequest(id: number, approvedById: number, rejectionReason: string): Promise<TransferRequestType | undefined> {
    const request = this.transferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: TransferRequestType = {
      ...request,
      status: 'rejected',
      approvedById,
      rejectionReason
    };
    
    this.transferRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async completeTransferRequest(id: number): Promise<TransferRequestType | undefined> {
    const request = this.transferRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: TransferRequestType = {
      ...request,
      status: 'completed',
      completedAt: new Date()
    };
    
    this.transferRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Loan methods
  async getLoan(id: number): Promise<LoanType | undefined> {
    return this.loans.get(id);
  }

  async getAllLoans(): Promise<LoanType[]> {
    return Array.from(this.loans.values());
  }

  async createLoan(insertLoan: InsertLoan): Promise<LoanType> {
    const id = this.currentLoanId++;
    const loan: LoanType = {
      ...insertLoan,
      id,
      requiresApproval: insertLoan.requiresApproval !== undefined ? insertLoan.requiresApproval : false,
      eligibilityRequirements: insertLoan.eligibilityRequirements || null
    };
    this.loans.set(id, loan);
    return loan;
  }

  // Loan Application methods
  async getLoanApplication(id: number): Promise<LoanApplicationType | undefined> {
    return this.loanApplications.get(id);
  }

  async getUserLoanApplications(userId: number): Promise<LoanApplicationType[]> {
    return Array.from(this.loanApplications.values())
      .filter((application) => application.userId === userId)
      .sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
  }

  async getPendingLoanApplications(): Promise<LoanApplicationType[]> {
    return Array.from(this.loanApplications.values())
      .filter((application) => application.status === 'pending')
      .sort((a, b) => a.applicationDate.getTime() - b.applicationDate.getTime());
  }

  async createLoanApplication(insertApplication: InsertLoanApplication): Promise<LoanApplicationType> {
    const id = this.currentLoanApplicationId++;
    const application: LoanApplicationType = {
      id,
      userId: insertApplication.userId,
      loanId: insertApplication.loanId,
      requestedAmount: insertApplication.requestedAmount,
      term: insertApplication.term,
      purposeOfLoan: insertApplication.purposeOfLoan,
      monthlyIncome: insertApplication.monthlyIncome,
      existingDebt: insertApplication.existingDebt || "0",
      employmentStatus: insertApplication.employmentStatus,
      applicationDate: new Date(),
      status: 'pending',
      approvedAmount: null,
      approvedTermMonths: null,
      approvedInterestRate: null,
      approvedById: null,
      rejectionReason: null,
      approvalDate: null,
      accountId: insertApplication.accountId || null,
      creditScore: insertApplication.creditScore || null,
      employerName: insertApplication.employerName || null,
      employmentDuration: insertApplication.employmentDuration || null
    };
    this.loanApplications.set(id, application);
    return application;
  }

  async approveLoanApplication(
    id: number, 
    approvedById: number, 
    approvedAmount: number, 
    approvedTermMonths: number, 
    approvedInterestRate: number
  ): Promise<LoanApplicationType | undefined> {
    const application = this.loanApplications.get(id);
    if (!application) return undefined;

    const updatedApplication: LoanApplicationType = {
      ...application,
      status: 'approved',
      approvedAmount: approvedAmount.toString(),
      approvedTermMonths,
      approvedInterestRate: approvedInterestRate.toString(),
      approvedById,
      approvalDate: new Date(),
    };

    this.loanApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async rejectLoanApplication(
    id: number,
    approvedById: number,
    rejectionReason: string
  ): Promise<LoanApplicationType | undefined> {
    const application = this.loanApplications.get(id);
    if (!application) return undefined;

    const updatedApplication: LoanApplicationType = {
      ...application,
      status: 'rejected',
      approvedById,
      rejectionReason,
    };

    this.loanApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Transaction Categorization methods
  async updateTransactionCategory(id: number, category: string, subcategory?: string, tags?: string[], notes?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      category: category,
      subcategory: subcategory || null,
      tags: tags || [],
      notes: notes || null,
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async getTransactionCategories(): Promise<string[]> {
    // Return a default set of categories
    return [
      "income",
      "shopping",
      "food",
      "utilities",
      "transportation",
      "housing",
      "entertainment",
      "health",
      "education",
      "personal",
      "travel",
      "business",
      "investments",
      "transfers",
      "uncategorized"
    ];
  }
  
  async getTransactionSubcategories(category: string): Promise<string[]> {
    // Return subcategories based on the main category
    const subcategories: Record<string, string[]> = {
      "income": ["salary", "bonus", "interest", "dividends", "gifts", "refunds", "other"],
      "shopping": ["clothing", "electronics", "groceries", "home", "online", "gifts", "other"],
      "food": ["restaurants", "fast food", "coffee shops", "groceries", "delivery", "other"],
      "utilities": ["electricity", "water", "gas", "internet", "phone", "cable", "streaming", "other"],
      "transportation": ["public transit", "gas", "parking", "car payment", "rideshare", "maintenance", "other"],
      "housing": ["rent", "mortgage", "insurance", "property tax", "repairs", "furniture", "other"],
      "entertainment": ["movies", "games", "music", "events", "subscriptions", "hobbies", "other"],
      "health": ["insurance", "doctor", "pharmacy", "fitness", "other"],
      "education": ["tuition", "books", "courses", "student loans", "other"],
      "personal": ["beauty", "self-care", "clothing", "other"],
      "travel": ["flights", "hotels", "car rental", "activities", "food", "other"],
      "business": ["office supplies", "marketing", "services", "software", "other"],
      "investments": ["stocks", "bonds", "crypto", "retirement", "other"],
      "transfers": ["internal", "external", "other"],
      "uncategorized": ["other"]
    };
    
    return subcategories[category] || ["other"];
  }
}

export const storage = new MemStorage();
