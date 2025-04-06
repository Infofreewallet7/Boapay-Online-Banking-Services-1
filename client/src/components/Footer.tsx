import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and brief description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-primary">Boapay</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Modern banking solutions for your financial needs. Secure, fast, and user-friendly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-600 hover:text-primary">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-600 hover:text-primary">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a className="text-gray-600 hover:text-primary">Services</a>
                </Link>
              </li>
              <li>
                <Link href="/features">
                  <a className="text-gray-600 hover:text-primary">Features</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-gray-600 hover:text-primary">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-600 hover:text-primary">Contact</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Banking Services */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Banking Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/accounts">
                  <a className="text-gray-600 hover:text-primary">Accounts</a>
                </Link>
              </li>
              <li>
                <Link href="/transfers">
                  <a className="text-gray-600 hover:text-primary">Money Transfers</a>
                </Link>
              </li>
              <li>
                <Link href="/loans">
                  <a className="text-gray-600 hover:text-primary">Loans & Credit</a>
                </Link>
              </li>
              <li>
                <Link href="/payments">
                  <a className="text-gray-600 hover:text-primary">Bill Payments</a>
                </Link>
              </li>
              <li>
                <Link href="/crypto">
                  <a className="text-gray-600 hover:text-primary">Cryptocurrency</a>
                </Link>
              </li>
              <li>
                <Link href="/security">
                  <a className="text-gray-600 hover:text-primary">Security</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                <span className="text-gray-600">
                  123 Financial Street, Banking District,<br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                <span className="text-gray-600">+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                <span className="text-gray-600">support@boapay.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {year} Boapay. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy">
                <a className="text-gray-500 hover:text-primary text-sm">Privacy Policy</a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-500 hover:text-primary text-sm">Terms of Service</a>
              </Link>
              <Link href="/cookies">
                <a className="text-gray-500 hover:text-primary text-sm">Cookies Policy</a>
              </Link>
              <Link href="/security">
                <a className="text-gray-500 hover:text-primary text-sm">Security</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}