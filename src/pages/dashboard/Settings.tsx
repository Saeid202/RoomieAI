
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [accountForm, setAccountForm] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    newMatches: true,
    messages: true,
    marketUpdates: false,
    newProperties: true,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
  });
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationToggle = (name: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof notificationSettings]
    }));
  };
  
  const handleSecurityToggle = (name: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof securitySettings]
    }));
  };
  
  const handleSaveAccount = () => {
    toast({
      title: "Account updated",
      description: "Your account information has been saved.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    });
  };
  
  const handleSaveSecurity = () => {
    toast({
      title: "Security settings updated",
      description: "Your security settings have been saved.",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={accountForm.name}
                  onChange={handleAccountChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                />
              </div>
              <Button onClick={handleSaveAccount} className="bg-roomie-purple hover:bg-roomie-dark">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailAlerts} 
                    onCheckedChange={() => handleNotificationToggle("emailAlerts")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Match Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified when you have a new match</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newMatches}
                    onCheckedChange={() => handleNotificationToggle("newMatches")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Message Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified when you receive a new message</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.messages}
                    onCheckedChange={() => handleNotificationToggle("messages")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Market Updates</h4>
                    <p className="text-sm text-muted-foreground">Receive real estate market updates</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.marketUpdates}
                    onCheckedChange={() => handleNotificationToggle("marketUpdates")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Property Listings</h4>
                    <p className="text-sm text-muted-foreground">Get notified about new property listings</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.newProperties}
                    onCheckedChange={() => handleNotificationToggle("newProperties")}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications} className="bg-roomie-purple hover:bg-roomie-dark">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={() => handleSecurityToggle("twoFactorAuth")}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Change Password</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleSaveSecurity} className="bg-roomie-purple hover:bg-roomie-dark">
                  Update Security Settings
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
