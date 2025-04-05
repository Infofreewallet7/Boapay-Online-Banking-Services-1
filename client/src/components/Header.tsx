import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, User, CreditCard, LogOut, BarChart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/session"],
    retry: false,
  });
  
  const isAuthenticated = !!user;
  
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const isNavLinkActive = (path: string) => {
    return location === path;
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">B</span>
              </div>
              <h1 className="ml-2 text-xl font-bold text-primary">Boapay</h1>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/dashboard">
                  <a className={`${isNavLinkActive("/dashboard") ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"} font-medium px-1 py-2 inline-flex`}>
                    Home
                  </a>
                </Link>
                <Link to="/accounts">
                  <a className={`${isNavLinkActive("/accounts") ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"} font-medium px-1 py-2 inline-flex`}>
                    Accounts
                  </a>
                </Link>
                <Link to="/transactions">
                  <a className={`${isNavLinkActive("/transactions") ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"} font-medium px-1 py-2 inline-flex`}>
                    Transactions
                  </a>
                </Link>
                <Link to="/payments">
                  <a className={`${isNavLinkActive("/payments") ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"} font-medium px-1 py-2 inline-flex`}>
                    Payments
                  </a>
                </Link>
                <Link to="/support">
                  <a className={`${isNavLinkActive("/support") ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-primary"} font-medium px-1 py-2 inline-flex`}>
                    Support
                  </a>
                </Link>
              </nav>
            )}
          </div>
          
          <div className="hidden md:flex md:items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                      {user.firstName ? user.firstName[0] : ""}
                      {user.lastName ? user.lastName[0] : ""}
                    </div>
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                      <BarChart className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/accounts")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Accounts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              location !== "/" && (
                <Link to="/">
                  <Button>Login</Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden border-t border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <a className={`${isNavLinkActive("/dashboard") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Home
                </a>
              </Link>
              <Link to="/accounts">
                <a className={`${isNavLinkActive("/accounts") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Accounts
                </a>
              </Link>
              <Link to="/transactions">
                <a className={`${isNavLinkActive("/transactions") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Transactions
                </a>
              </Link>
              <Link to="/payments">
                <a className={`${isNavLinkActive("/payments") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Payments
                </a>
              </Link>
              <Link to="/support">
                <a className={`${isNavLinkActive("/support") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Support
                </a>
              </Link>
              <Link to="/settings">
                <a className={`${isNavLinkActive("/settings") ? "bg-primary bg-opacity-10 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"} block px-3 py-2 rounded-md text-base font-medium`}>
                  Settings
                </a>
              </Link>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName ? user.firstName[0] : ""}
                    {user.lastName ? user.lastName[0] : ""}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 px-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </>
          ) : (
            location !== "/" && (
              <div className="pt-4">
                <Link to="/">
                  <a className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark">
                    Login
                  </a>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
