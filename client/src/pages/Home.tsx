import { useRef } from "react";
import { 
  Wallet, 
  ArrowLeftRight, 
  Receipt, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Headset
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ServicesSection from "@/components/ServicesSection";
import AuthForms from "@/components/AuthForms";

export default function Home() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const authSectionRef = useRef<HTMLDivElement>(null);
  
  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 to-primary py-20 sm:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Banking Made Simple, Secure, and Smart
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl">
                Boapay offers modern banking solutions to help you manage your finances 
                efficiently with our powerful online platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  onClick={scrollToAuth}
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={scrollToServices}
                  className="border-white text-white hover:bg-white/10"
                >
                  Explore Services
                </Button>
              </div>
            </div>
            <div className="relative lg:h-full flex justify-center">
              <div className="rounded-lg bg-white shadow-xl overflow-hidden max-w-md">
                <div className="w-full h-full bg-gray-200 aspect-[4/3] flex items-center justify-center">
                  {/* Using SVG illustration instead of a real image */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 600"
                    className="p-8"
                  >
                    <rect width="800" height="600" fill="#f8fafc" />
                    <circle cx="400" cy="300" r="150" fill="#e0f2fe" />
                    <rect x="250" y="150" width="300" height="200" rx="10" fill="#ffffff" stroke="#1e40af" strokeWidth="3" />
                    <circle cx="400" cy="125" r="50" fill="#bfdbfe" stroke="#1e40af" strokeWidth="3" />
                    <rect x="275" y="200" width="250" height="30" rx="5" fill="#1e40af" />
                    <rect x="275" y="250" width="250" height="10" rx="5" fill="#bfdbfe" />
                    <rect x="275" y="280" width="250" height="10" rx="5" fill="#bfdbfe" />
                    <rect x="275" y="310" width="150" height="10" rx="5" fill="#bfdbfe" />
                    <circle cx="600" cy="150" r="50" fill="#1e40af" opacity="0.1" />
                    <circle cx="200" cy="400" r="75" fill="#1e40af" opacity="0.1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="hidden lg:block absolute right-0 bottom-0 opacity-10">
          <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="200" r="200" fill="white" />
            <circle cx="200" cy="250" r="150" fill="white" />
          </svg>
        </div>
      </section>

      {/* About Section - Explanation Paragraph */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Future of Banking is Here
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Boapay is a comprehensive online banking platform designed to simplify your financial life. 
              With powerful features like multi-currency accounts, instant domestic and international transfers, 
              AI-powered transaction categorization, and cryptocurrency integration, we offer everything you 
              need in a modern banking solution. Our platform combines cutting-edge security measures with 
              an intuitive interface, making it both safe and easy to manage your finances from anywhere in the world.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={scrollToServices}>
                Learn More About Our Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the advantages of our innovative banking platform designed to make 
              managing your finances easier, faster, and more secure.
            </p>
            <div className="w-20 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                <Wallet className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Account Management</h3>
              <p className="text-gray-600">View balances, transaction history, and manage your account details.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                <ArrowLeftRight className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fund Transfers</h3>
              <p className="text-gray-600">Easily send and receive money to other accounts and external banks.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bill Payments</h3>
              <p className="text-gray-600">Pay your utility bills, subscriptions, and other services online.</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Security</h3>
              <p className="text-gray-600">Benefit from multi-factor authentication and advanced security measures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div ref={servicesRef}>
        <ServicesSection />
      </div>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to experience seamless online banking?</h2>
            <p className="text-lg text-blue-100 mb-8">Open a Boapay account today and enjoy a world of convenient financial services.</p>
            <Button 
              size="lg"
              onClick={scrollToAuth}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Open an Account Now
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Boapay?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">We combine cutting-edge technology with exceptional customer service to provide you with the best banking experience.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast Transactions</h3>
                <p className="text-gray-600">Process transfers and payments in seconds, not days.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bank-Grade Security</h3>
                <p className="text-gray-600">Your data and money are protected by state-of-the-art security.</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 text-primary mb-4">
                  <Headset className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">Get help whenever you need it with our around-the-clock support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Forms Section */}
      <div ref={authSectionRef}>
        <AuthForms />
      </div>
    </>
  );
}
