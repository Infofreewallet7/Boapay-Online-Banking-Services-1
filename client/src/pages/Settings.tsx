import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Save, User, Shield, Bell, Key, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { isLoading, data: user } = useQuery({
    queryKey: ["/api/auth/session"],
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["/api/auth/session"]});
      setLocation("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your settings...</span>
      </div>
    );
  }
  
  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.username}</p>
              </div>
            </div>
            
            <TabsList className="flex flex-col h-auto bg-transparent space-y-1">
              <TabsTrigger value="profile" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start">
                <Shield className="mr-2 h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and redirected to the home page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    {logoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging Out...
                      </>
                    ) : (
                      "Log Out"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <div className="flex-1">
            <TabsContent value="profile">
              <ProfileSettings user={user} />
            </TabsContent>
            
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={user.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={user.lastName} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue={user.email} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" defaultValue={user.phone} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue={user.username} disabled />
            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>
          
          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false);
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset form
      const form = e.target as HTMLFormElement;
      form.reset();
    }, 1500);
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" required />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long and include a mix of letters, numbers, and symbols
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" required />
            </div>
            
            <Button type="submit" className="mt-2" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500 mt-1">
                Enable two-factor authentication for enhanced security
              </p>
            </div>
            <Button variant="outline">Setup 2FA</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent login activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h4 className="text-sm font-medium">Current Session</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Web Browser • {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Active
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium">Previous Login</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Mobile App • {new Date(Date.now() - 86400000).toLocaleDateString()} • {new Date(Date.now() - 86400000).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0 text-sm">View Full Login History</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Notification preferences saved",
        description: "Your notification settings have been updated successfully.",
      });
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Account Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-alerts" className="cursor-pointer">Login Alerts</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications when there's a login attempt on your account
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="login-alerts"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transaction-alerts" className="cursor-pointer">Transaction Alerts</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications for deposits, withdrawals, and transfers
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="transaction-alerts"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="bill-payment-alerts" className="cursor-pointer">Bill Payment Alerts</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications for upcoming bill payments and successful payments
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="bill-payment-alerts"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Marketing Communications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="product-updates" className="cursor-pointer">Product Updates</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications about new features and improvements
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="product-updates"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotional-offers" className="cursor-pointer">Promotional Offers</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive special offers, promotions, and discounts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="promotional-offers"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="cursor-pointer">Email Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications" className="cursor-pointer">SMS Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications via text message
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="sms-notifications"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications" className="cursor-pointer">Push Notifications</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive notifications on your mobile device
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="push-notifications"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
