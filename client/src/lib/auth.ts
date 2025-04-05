import { apiRequest, queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

// Type definitions
export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isVerified: boolean;
}

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

// Hook for login functionality
export function useLogin() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const user = await response.json();
      return user as AuthUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/session"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook for registration functionality
export function useRegister() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const user = await response.json();
      return user as AuthUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/session"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to Boapay, ${user.firstName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook for logout functionality
export function useLogout() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Helper functions
export function isAuthenticated(): boolean {
  const user = queryClient.getQueryData<AuthUser | null>(["/api/auth/session"]);
  return !!user;
}

export function getCurrentUser(): AuthUser | null {
  return queryClient.getQueryData<AuthUser | null>(["/api/auth/session"]) || null;
}
