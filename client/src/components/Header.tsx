import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold text-primary">Boapay</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary font-medium">Home</a>
            </Link>
            
            {/* Services Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center text-gray-700 hover:text-primary font-medium"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {servicesOpen && (
                <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/accounts">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Accounts</a>
                  </Link>
                  <Link href="/payments">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Payments</a>
                  </Link>
                  <Link href="/transfers">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Transfers</a>
                  </Link>
                  <Link href="/loans">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Loans</a>
                  </Link>
                  <Link href="/crypto">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Cryptocurrency</a>
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/about">
              <a className="text-gray-700 hover:text-primary font-medium">About Us</a>
            </Link>
            
            <Link href="/support">
              <a className="text-gray-700 hover:text-primary font-medium">Support</a>
            </Link>
            
            <Link href="/contact">
              <a className="text-gray-700 hover:text-primary font-medium">Contact</a>
            </Link>
          </nav>
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link href="#login-section">
                <a>Login</a>
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="#register-section">
                <a>Sign Up</a>
              </Link>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-gray-50 border-t">
          <div className="flex flex-col space-y-3">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary font-medium py-2">Home</a>
            </Link>
            
            {/* Mobile Services Dropdown */}
            <div>
              <button 
                className="flex items-center text-gray-700 hover:text-primary font-medium py-2 w-full text-left"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Services
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {servicesOpen && (
                <div className="pl-4 mt-1 border-l-2 border-gray-200 space-y-2">
                  <Link href="/accounts">
                    <a className="block py-1 text-gray-700 hover:text-primary">Accounts</a>
                  </Link>
                  <Link href="/payments">
                    <a className="block py-1 text-gray-700 hover:text-primary">Payments</a>
                  </Link>
                  <Link href="/transfers">
                    <a className="block py-1 text-gray-700 hover:text-primary">Transfers</a>
                  </Link>
                  <Link href="/loans">
                    <a className="block py-1 text-gray-700 hover:text-primary">Loans</a>
                  </Link>
                  <Link href="/crypto">
                    <a className="block py-1 text-gray-700 hover:text-primary">Cryptocurrency</a>
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/about">
              <a className="text-gray-700 hover:text-primary font-medium py-2">About Us</a>
            </Link>
            
            <Link href="/support">
              <a className="text-gray-700 hover:text-primary font-medium py-2">Support</a>
            </Link>
            
            <Link href="/contact">
              <a className="text-gray-700 hover:text-primary font-medium py-2">Contact</a>
            </Link>
            
            <div className="flex space-x-3 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="#login-section">
                  <a>Login</a>
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="#register-section">
                  <a>Sign Up</a>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}