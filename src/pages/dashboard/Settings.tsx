
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Bell, Shield, User, Mail } from "lucide-react";

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
    <div className="w-full px-4 space-y-6 pb-10">
      {/* Page Header with Organizational Style */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Header Content - Left Aligned */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 border-2 border-purple-200 p-1">
          <TabsTrigger value="account" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-bold">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-bold">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-bold">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-6 relative z-10 space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Account Information
                </h3>
                <p className="text-sm text-gray-600 font-medium">Update your personal information</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 text-gray-900 font-semibold">
                    <User className="h-4 w-4 text-purple-600" />
                    Name
                  </Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={accountForm.name}
                    onChange={handleAccountChange}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Mail className="h-4 w-4 text-purple-600" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={accountForm.email}
                    onChange={handleAccountChange}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveAccount} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-6 relative z-10 space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Notification Preferences
                </h3>
                <p className="text-sm text-gray-600 font-medium">Control which notifications you receive</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: "emailAlerts", title: "Email Alerts", desc: "Receive important alerts via email" },
                  { key: "newMatches", title: "New Match Notifications", desc: "Get notified when you have a new match" },
                  { key: "messages", title: "Message Notifications", desc: "Get notified when you receive a new message" },
                  { key: "marketUpdates", title: "Market Updates", desc: "Receive real estate market updates" },
                  { key: "newProperties", title: "New Property Listings", desc: "Get notified about new property listings" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                    <div>
                      <h4 className="font-black text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 font-medium">{item.desc}</p>
                    </div>
                    <Switch 
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]} 
                      onCheckedChange={() => handleNotificationToggle(item.key)}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-600"
                    />
                  </div>
                ))}
              </div>
              
              <Button onClick={handleSaveNotifications} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all w-full">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-6 relative z-10 space-y-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Security Settings
                </h3>
                <p className="text-sm text-gray-600 font-medium">Manage your account security</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                <div>
                  <h4 className="font-black text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 font-medium">Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={() => handleSecurityToggle("twoFactorAuth")}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-purple-600"
                />
              </div>
              
              <div className="p-4 bg-white/80 rounded-xl border-2 border-purple-200">
                <h4 className="font-black text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-900 font-semibold">Current Password</Label>
                    <Input id="currentPassword" type="password" className="border-2 border-purple-200 focus:border-purple-500 bg-white/90" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-900 font-semibold">New Password</Label>
                    <Input id="newPassword" type="password" className="border-2 border-purple-200 focus:border-purple-500 bg-white/90" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-900 font-semibold">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="border-2 border-purple-200 focus:border-purple-500 bg-white/90" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleSaveSecurity} className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  Update Security Settings
                </Button>
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="flex items-center gap-2 font-bold py-6 px-6"
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
