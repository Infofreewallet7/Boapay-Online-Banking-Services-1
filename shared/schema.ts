import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationCode: text("verification_code"),
  isApproved: boolean("is_approved").default(false).notNull(),
  role: text("role").default("user").notNull(), // 'user', 'admin'
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: text("account_number").notNull().unique(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // checking, savings, crypto
  balance: decimal("balance", { precision: 19, scale: 8 }).default("0").notNull(), // Increased precision for crypto
  currency: varchar("currency", { length: 10 }).default("USD").notNull(), // USD, EUR, BTC, ETH, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isCrypto: boolean("is_crypto").default(false).notNull(), // Whether this is a crypto account
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: decimal("amount", { precision: 19, scale: 8 }).notNull(), // Increased precision for crypto
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'transfer', 'crypto_purchase', 'crypto_exchange'
  description: text("description").notNull(),
  reference: text("reference").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  receiverAccount: text("receiver_account"),
  senderAccount: text("sender_account"),
  currency: varchar("currency", { length: 10 }).default("USD"), // Increased length for crypto currencies
  exchangeRate: decimal("exchange_rate", { precision: 19, scale: 8 }), // For crypto conversions
  targetCurrency: varchar("target_currency", { length: 10 }), // For crypto conversions
  fees: decimal("fees", { precision: 19, scale: 8 }).default("0"), // Transaction fees
  isApproved: boolean("is_approved").default(false), // Admin approval
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  category: text("category"), // 'shopping', 'food', 'utilities', 'entertainment', etc.
  subcategory: text("subcategory"), // More specific categorization
  tags: text("tags").array(), // Custom tags for the transaction
  notes: text("notes"), // Additional user notes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  billName: text("bill_name").notNull(),
  billCategory: text("bill_category").notNull(), // 'utility', 'subscription', 'loan', etc.
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  accountNumber: text("account_number").notNull(),
  billReference: text("bill_reference").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull(), // 'pending', 'paid', 'overdue'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billPayments = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").references(() => bills.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: text("reference").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
});

export const externalBankAccounts = pgTable("external_bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  swiftCode: varchar("swift_code", { length: 11 }).notNull(),
  routingNumber: varchar("routing_number", { length: 9 }),
  iban: varchar("iban", { length: 34 }),
  country: text("country").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  accountType: text("account_type").default("checking").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  memo: text("memo"), // For additional notes/details about the account
});

export const internationalTransfers = pgTable("international_transfers", {
  id: serial("id").primaryKey(),
  sourceAccountId: integer("source_account_id").references(() => accounts.id).notNull(),
  externalAccountId: integer("external_account_id").references(() => externalBankAccounts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }), // The exchange rate at the time of transfer
  sourceCurrency: varchar("source_currency", { length: 3 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0").notNull(),
  totalDebit: decimal("total_debit", { precision: 10, scale: 2 }).notNull(), // Total amount debited including fees
  reference: text("reference").notNull(),
  purposeOfTransfer: text("purpose_of_transfer").notNull(),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  estimatedDelivery: timestamp("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  failureReason: text("failure_reason"),
  isApproved: boolean("is_approved").default(false).notNull(),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
});

export const transferRequests = pgTable("transfer_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromAccountId: integer("from_account_id").references(() => accounts.id).notNull(),
  toAccountNumber: text("to_account_number").notNull(),
  toAccountName: text("to_account_name").notNull(),
  toBankName: text("to_bank_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  isExternal: boolean("is_external").default(false).notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected', 'completed'
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  approvedById: integer("approved_by_id").references(() => users.id),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  loanType: text("loan_type").notNull(), // 'personal', 'business', 'overdraft', 'emergency', 'large_purchase', 'student', 'credit'
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).notNull(),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(), // in percentage
  termMonths: integer("term_months").notNull(), // loan term in months
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  description: text("description").notNull(),
  eligibilityRequirements: text("eligibility_requirements"),
});

export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  requestedAmount: decimal("requested_amount", { precision: 10, scale: 2 }).notNull(),
  term: integer("term").notNull(), // requested term in months
  purposeOfLoan: text("purpose_of_loan").notNull(),
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).notNull(),
  existingDebt: decimal("existing_debt", { precision: 10, scale: 2 }).default("0").notNull(),
  creditScore: integer("credit_score"),
  employmentStatus: text("employment_status").notNull(), // 'employed', 'self_employed', 'student', 'unemployed', 'retired'
  employerName: text("employer_name"),
  employmentDuration: integer("employment_duration"), // in months
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected'
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }),
  approvedTermMonths: integer("approved_term_months"),
  approvedInterestRate: decimal("approved_interest_rate", { precision: 5, scale: 2 }),
  approvedById: integer("approved_by_id").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  accountId: integer("account_id").references(() => accounts.id), // account to deposit loan amount
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  approvalDate: timestamp("approval_date"),
});

export const cryptocurrencies = pgTable("cryptocurrencies", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // BTC, ETH, etc.
  symbol: varchar("symbol", { length: 10 }).notNull(), // BTC, ETH, etc. (used for display)
  name: text("name").notNull(), // Bitcoin, Ethereum, etc.
  usdRate: decimal("usd_rate", { precision: 19, scale: 8 }).notNull(), // Exchange rate to USD
  eurRate: decimal("eur_rate", { precision: 19, scale: 8 }).notNull(), // Exchange rate to EUR
  currentPrice: decimal("current_price", { precision: 19, scale: 8 }).notNull(), // Current market price in USD
  available: boolean("available").default(true).notNull(), // Whether this cryptocurrency is available for trading
  minPurchaseAmount: decimal("min_purchase_amount", { precision: 19, scale: 8 }).default("0.0001").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Path to icon or symbol
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cryptoTransferRequests = pgTable("crypto_transfer_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromAccountId: integer("from_account_id").references(() => accounts.id).notNull(),
  toAccountId: integer("to_account_id").references(() => accounts.id), // For internal transfers
  externalAddress: text("external_address"), // For external transfers
  amount: decimal("amount", { precision: 19, scale: 8 }).notNull(),
  sourceCurrency: varchar("source_currency", { length: 10 }).notNull(),
  targetCurrency: varchar("target_currency", { length: 10 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 19, scale: 8 }),
  fees: decimal("fees", { precision: 19, scale: 8 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 19, scale: 8 }).notNull(), // Amount after fees
  totalInUSD: decimal("total_in_usd", { precision: 19, scale: 2 }), // USD equivalent value
  type: text("type").notNull(), // 'purchase', 'sale', 'exchange', 'transfer'
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected', 'completed'
  description: text("description").notNull(),
  isExternal: boolean("is_external").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  approvedById: integer("approved_by_id").references(() => users.id),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
});

// Schema Validators
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({
  id: true,
  paymentDate: true,
});

export const insertExternalBankAccountSchema = createInsertSchema(externalBankAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertInternationalTransferSchema = createInsertSchema(internationalTransfers).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  failureReason: true,
});

export const transferFundsSchema = z.object({
  fromAccount: z.string().min(1, "From account is required"),
  toAccount: z.string().min(1, "To account is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
});

export const billPaymentSchema = z.object({
  accountId: z.number().int().positive(),
  billId: z.number().int().positive(),
  amount: z.string().min(1, "Amount is required"),
});

export const internationalTransferSchema = z.object({
  sourceAccountId: z.number().int().positive("Source account is required"),
  externalAccountId: z.number().int().positive("Destination account is required"),
  amount: z.string().min(1, "Amount is required"),
  purposeOfTransfer: z.string().min(1, "Purpose of transfer is required"),
});

export const insertTransferRequestSchema = createInsertSchema(transferRequests).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  approvedById: true,
  completedAt: true,
  rejectionReason: true,
});

export const transferRequestSchema = z.object({
  fromAccountId: z.number().int().positive("Source account is required"),
  toAccountNumber: z.string().min(1, "Destination account number is required"),
  toAccountName: z.string().min(1, "Destination account name is required"),
  toBankName: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
  isExternal: z.boolean().default(false),
  description: z.string().min(1, "Description is required"),
});

export const verifyUserSchema = z.object({
  verificationCode: z.string().min(6, "Verification code is required"),
});

export const approveUserSchema = z.object({
  userId: z.number().int().positive("User ID is required"),
});

export const approveTransferSchema = z.object({
  transferRequestId: z.number().int().positive("Transfer request ID is required"),
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  applicationDate: true,
  approvalDate: true,
  approvedById: true,
  rejectionReason: true,
});

export const loanApplicationRequestSchema = z.object({
  loanId: z.number().int().positive("Loan ID is required"),
  requestedAmount: z.string().min(1, "Requested amount is required"),
  term: z.number().int().positive("Loan term is required"),
  purposeOfLoan: z.string().min(1, "Purpose of loan is required"),
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  existingDebt: z.string().default("0"),
  creditScore: z.number().int().min(300).max(850).optional(),
  employmentStatus: z.string().min(1, "Employment status is required"),
  employerName: z.string().optional(),
  employmentDuration: z.number().int().optional(),
  accountId: z.number().int().positive("Account ID is required"),
});

export const approveLoanSchema = z.object({
  loanApplicationId: z.number().int().positive("Loan application ID is required"),
  approvedAmount: z.string().min(1, "Approved amount is required"),
  approvedTermMonths: z.number().int().positive("Approved term is required"),
  approvedInterestRate: z.string().min(1, "Approved interest rate is required"),
});

export const rejectLoanSchema = z.object({
  loanApplicationId: z.number().int().positive("Loan application ID is required"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const insertCryptocurrencySchema = createInsertSchema(cryptocurrencies).omit({
  id: true,
  updatedAt: true,
});

export const insertCryptoTransferRequestSchema = createInsertSchema(cryptoTransferRequests).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  approvedById: true,
  completedAt: true,
  rejectionReason: true,
});

export const cryptoPurchaseSchema = z.object({
  sourceAccountId: z.number().int().positive("Source account is required"),
  cryptoSymbol: z.string().min(1, "Cryptocurrency symbol is required"),
  amount: z.string().min(1, "Amount is required"),
});

export const transactionCategorizationSchema = z.object({
  transactionId: z.number().int().positive("Transaction ID is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const categorySuggestionSchema = z.object({
  description: z.string().min(1, "Transaction description is required"),
  amount: z.string().min(1, "Amount is required"),
  type: z.string().min(1, "Transaction type is required"),
});

export const cryptoExchangeSchema = z.object({
  fromAccountId: z.number().int().positive("Source account is required"),
  toSymbol: z.string().min(1, "Destination cryptocurrency symbol is required"),
  amount: z.string().min(1, "Amount is required"),
});

export const approveCryptoTransferSchema = z.object({
  cryptoTransferId: z.number().int().positive("Crypto transfer ID is required"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type InsertExternalBankAccount = z.infer<typeof insertExternalBankAccountSchema>;
export type InsertInternationalTransfer = z.infer<typeof insertInternationalTransferSchema>;
export type InsertTransferRequest = z.infer<typeof insertTransferRequestSchema>;
export type TransferFunds = z.infer<typeof transferFundsSchema>;
export type BillPayment = z.infer<typeof billPaymentSchema>;
export type InternationalTransfer = z.infer<typeof internationalTransferSchema>;
export type TransferRequest = z.infer<typeof transferRequestSchema>;
export type VerifyUser = z.infer<typeof verifyUserSchema>;
export type ApproveUser = z.infer<typeof approveUserSchema>;
export type ApproveTransfer = z.infer<typeof approveTransferSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type LoanApplicationRequest = z.infer<typeof loanApplicationRequestSchema>;
export type ApproveLoan = z.infer<typeof approveLoanSchema>;
export type RejectLoan = z.infer<typeof rejectLoanSchema>;

export type InsertCryptocurrency = z.infer<typeof insertCryptocurrencySchema>;
export type InsertCryptoTransferRequest = z.infer<typeof insertCryptoTransferRequestSchema>;
export type CryptoPurchase = z.infer<typeof cryptoPurchaseSchema>;
export type CryptoExchange = z.infer<typeof cryptoExchangeSchema>;
export type ApproveCryptoTransfer = z.infer<typeof approveCryptoTransferSchema>;
export type TransactionCategorization = z.infer<typeof transactionCategorizationSchema>;
export type CategorySuggestion = z.infer<typeof categorySuggestionSchema>;

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillPaymentType = typeof billPayments.$inferSelect;
export type ExternalBankAccount = typeof externalBankAccounts.$inferSelect;
export type InternationalTransferType = typeof internationalTransfers.$inferSelect;
export type TransferRequestType = typeof transferRequests.$inferSelect;
export type LoanType = typeof loans.$inferSelect;
export type LoanApplicationType = typeof loanApplications.$inferSelect;
export type CryptocurrencyType = typeof cryptocurrencies.$inferSelect;
export type CryptoTransferRequestType = typeof cryptoTransferRequests.$inferSelect;
