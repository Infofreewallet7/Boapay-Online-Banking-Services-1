import { 
  CreditCard, 
  ArrowRightLeft, 
  RefreshCw, 
  Building, 
  PiggyBank, 
  ShieldCheck,
  Bitcoin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const services = [
  {
    icon: <CreditCard className="h-10 w-10" />,
    title: "Personal Banking",
    description: "Manage your everyday finances with our feature-rich checking and savings accounts.",
    link: "/accounts"
  },
  {
    icon: <ArrowRightLeft className="h-10 w-10" />,
    title: "Money Transfers",
    description: "Send money locally and internationally with competitive rates and fast processing.",
    link: "/transfers"
  },
  {
    icon: <RefreshCw className="h-10 w-10" />,
    title: "Currency Exchange",
    description: "Exchange currencies at great rates with minimal fees for all your international needs.",
    link: "/exchange"
  },
  {
    icon: <Building className="h-10 w-10" />,
    title: "Business Banking",
    description: "Comprehensive business solutions from small startups to large corporations.",
    link: "/business"
  },
  {
    icon: <PiggyBank className="h-10 w-10" />,
    title: "Loans & Credit",
    description: "Personal loans, mortgages, and credit products with competitive interest rates.",
    link: "/loans"
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: "Secure Banking",
    description: "Enhanced security features to protect your finances and personal information.",
    link: "/security"
  },
  {
    icon: <Bitcoin className="h-10 w-10" />,
    title: "Cryptocurrency",
    description: "Buy, sell, and exchange cryptocurrencies with our secure digital currency platform.",
    link: "/crypto"
  }
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gray-50" id="services">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Boapay offers a wide range of financial services to meet your personal and business needs, 
            all designed with security, efficiency, and ease of use in mind.
          </p>
          <div className="w-20 h-1 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100"
            >
              <div className="text-primary mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Link href={service.link}>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Learn more
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}