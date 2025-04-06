import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { Lock } from "lucide-react";

export default function AuthForms() {
  const [showForms, setShowForms] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  const handleLoginClick = () => {
    setActiveTab("login");
    setShowForms(true);
  };
  
  const handleRegisterClick = () => {
    setActiveTab("register");
    setShowForms(true);
  };
  
  return (
    <section id="auth-section" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Boapay Today</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access secure online banking with a few clicks. Log in to your existing account or sign up for a new one.
          </p>
        </div>
        
        {!showForms ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" onClick={handleLoginClick}>
              Login to Your Account
            </Button>
            <Button size="lg" variant="outline" onClick={handleRegisterClick}>
              Create New Account
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Tabs 
              defaultValue={activeTab} 
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
                <div className="mt-6 bg-blue-50 border-l-4 border-primary p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-primary-900">
                        For security reasons, please ensure you're on the official Boapay website before entering your login details.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-6">
              <Button variant="link" onClick={() => setShowForms(false)}>
                ← Back to options
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}