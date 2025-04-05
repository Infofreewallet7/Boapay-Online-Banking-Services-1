import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react";
import { loginUserSchema, type LoginUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: async (response) => {
      const userData = await response.json();
      queryClient.setQueryData(["/api/auth/session"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary px-6 py-6">
        <CardTitle className="text-2xl font-bold text-white text-center">
          Secure Login
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / Account Number</FormLabel>
                  <FormControl>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input 
                        placeholder="Enter your username" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                  </div>
                  <FormControl>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter your password" 
                        className="pl-10 pr-10" 
                        {...field} 
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-500"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-700">
                Forgot Password?
              </a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Your Account"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                New to Boapay?
              </span>
            </div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">
              Create an Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
