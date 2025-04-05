import { z } from "zod";

// Utility function for validations
export const validators = {
  // Username validation
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  
  // Password validation
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  
  // Email validation
  email: z.string()
    .email("Please enter a valid email address"),
  
  // Phone validation
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9-+() ]+$/, "Phone number can only contain numbers, spaces, and special characters"),
  
  // Money amount validation
  moneyAmount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number with up to 2 decimal places")
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),
  
  // Account number validation
  accountNumber: z.string()
    .min(5, "Account number must be at least 5 characters")
    .max(20, "Account number must be less than 20 characters")
    .regex(/^[0-9]+$/, "Account number can only contain numbers"),
};

// Extended schemas for specific forms
export const loginFormSchema = z.object({
  username: validators.username,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = z.object({
  username: validators.username,
  password: validators.password,
  confirmPassword: z.string().min(1, "Confirm password is required"),
  email: validators.email,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: validators.phone,
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const transferFormSchema = z.object({
  fromAccount: validators.accountNumber,
  toAccount: validators.accountNumber,
  amount: validators.moneyAmount,
  description: z.string().min(1, "Description is required"),
}).refine((data) => data.fromAccount !== data.toAccount, {
  message: "Source and destination accounts cannot be the same",
  path: ["toAccount"],
});

export const billPaymentFormSchema = z.object({
  accountId: z.number().int().positive("Please select an account"),
  billId: z.number().int().positive("Please select a bill"),
  amount: validators.moneyAmount,
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type TransferFormValues = z.infer<typeof transferFormSchema>;
export type BillPaymentFormValues = z.infer<typeof billPaymentFormSchema>;
