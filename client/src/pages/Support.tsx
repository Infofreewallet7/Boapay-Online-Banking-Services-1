import { useState } from "react";
import { 
  Loader2, 
  LifeBuoy, 
  Mail, 
  MessageSquare, 
  Phone, 
  FileQuestion, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Support() {
  const [contactFormLoading, setContactFormLoading] = useState(false);
  
  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setContactFormLoading(false);
      alert("Your message has been sent! Our team will get back to you shortly.");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
        <p className="text-gray-600">Get help and support for your banking needs</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                  <AccordionContent>
                    You can reset your password by clicking on the "Forgot Password" link on the login page. 
                    You will receive an email with instructions to reset your password. For security reasons, 
                    the link will expire after 30 minutes.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I set up account alerts?</AccordionTrigger>
                  <AccordionContent>
                    You can set up account alerts by going to the Settings page and selecting "Notifications & Alerts." 
                    From there, you can choose which types of alerts you want to receive and how you want to receive them 
                    (email, SMS, or push notifications).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>What should I do if I notice unauthorized transactions?</AccordionTrigger>
                  <AccordionContent>
                    If you notice any unauthorized transactions, please contact our customer support immediately 
                    at 1-800-BOAPAY (1-800-262-7290). It's important to report such activities as soon as possible 
                    to minimize potential losses.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>How long do transfers take to process?</AccordionTrigger>
                  <AccordionContent>
                    Transfers between Boapay accounts are processed instantly. Transfers to external bank accounts 
                    typically take 1-3 business days depending on the receiving bank's processing times.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>Is my data secure with Boapay?</AccordionTrigger>
                  <AccordionContent>
                    Yes, your data is secured with industry-standard encryption and security measures. 
                    We use multi-factor authentication, real-time fraud monitoring, and regular security 
                    audits to ensure your financial information remains protected.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I update my contact information?</AccordionTrigger>
                  <AccordionContent>
                    You can update your contact information by going to the Settings page and selecting 
                    "Personal Information." There, you can edit your email, phone number, and address. 
                    For security purposes, some changes may require additional verification.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <Input required placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <Input required type="email" placeholder="Enter your email" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <Input required placeholder="What is your inquiry about?" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <Textarea required placeholder="Please describe your issue or question in detail" rows={5} />
                </div>
                
                <Button type="submit" className="w-full" disabled={contactFormLoading}>
                  {contactFormLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach us through your preferred channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Phone Support</h4>
                    <p className="mt-1 text-sm text-gray-600">1-800-BOAPAY (1-800-262-7290)</p>
                    <p className="mt-1 text-xs text-gray-500">Available 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Email Support</h4>
                    <p className="mt-1 text-sm text-gray-600">support@boapay.com</p>
                    <p className="mt-1 text-xs text-gray-500">Responses within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Live Chat</h4>
                    <p className="mt-1 text-sm text-gray-600">Available in your dashboard</p>
                    <p className="mt-1 text-xs text-gray-500">9AM - 9PM EST, Mon-Fri</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Self-Service Resources</CardTitle>
              <CardDescription>Explore our help center resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  <span>User Guides</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  <span>Video Tutorials</span>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  <span>Security Center</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
