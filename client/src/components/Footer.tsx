import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, Apple, TabletSmartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary text-lg font-bold">B</span>
              </div>
              <h3 className="ml-2 text-xl font-bold">Boapay</h3>
            </div>
            <p className="text-gray-400 mb-4">Secure, convenient banking services for all your financial needs.</p>
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Boapay. All rights reserved.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">About Us</a></Link></li>
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">Careers</a></Link></li>
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">News & Media</a></Link></li>
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">Sustainability</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/support"><a className="text-gray-400 hover:text-white transition">Help Center</a></Link></li>
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">Privacy Policy</a></Link></li>
              <li><Link to="/"><a className="text-gray-400 hover:text-white transition">Terms of Service</a></Link></li>
              <li><Link to="/support"><a className="text-gray-400 hover:text-white transition">Contact Us</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Download Our App</h4>
              <div className="flex space-x-2">
                <a href="#" className="bg-gray-700 hover:bg-gray-600 transition rounded p-2">
                  <Apple className="h-5 w-5" />
                </a>
                <a href="#" className="bg-gray-700 hover:bg-gray-600 transition rounded p-2">
                  <TabletSmartphone className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-gray-400 text-sm">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <p>Boapay is a registered financial institution. NMLS ID: 123456</p>
            <p>All services are subject to applicable terms and conditions.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
