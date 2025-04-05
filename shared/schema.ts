import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accountNumber: text("account_number").notNull().unique(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'transfer'
  description: text("description").notNull(),
  reference: text("reference").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  receiverAccount: text("receiver_account"),
  senderAccount: text("sender_account"),
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type InsertExternalBankAccount = z.infer<typeof insertExternalBankAccountSchema>;
export type InsertInternationalTransfer = z.infer<typeof insertInternationalTransferSchema>;
export type TransferFunds = z.infer<typeof transferFundsSchema>;
export type BillPayment = z.infer<typeof billPaymentSchema>;
export type InternationalTransfer = z.infer<typeof internationalTransferSchema>;

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillPaymentType = typeof billPayments.$inferSelect;
export type ExternalBankAccount = typeof externalBankAccounts.$inferSelect;
export type InternationalTransferType = typeof internationalTransfers.$inferSelect;
