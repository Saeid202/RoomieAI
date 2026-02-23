import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchMortgageBrokerProfile, 
  saveMortgageBrokerProfile,
  fetchAllMortgageProfiles 
} from "@/services/mortgageBrokerService";
import { MortgageBrokerProfile, MortgageBrokerFormData } from "@/types/mortgageBroker";
import { MortgageProfile } from "@/types/mortgage";
import { Building2, Users, Phone, Mail, Award, User, LogOut } from "lucide-react";

export default function MortgageBrokerDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MortgageBrokerProfile | null>(null);
  const [clients, setClients] = useState<MortgageProfile[]>([]);
  const [formData, setFormData] = useState<MortgageBrokerFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    company_name: "",
    license_number: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      // Load broker profile
      const brokerProfile = await fetchMortgageBrokerProfile(user.id);
      if (brokerProfile) {
        setProfile(brokerProfile);
        setFormData({
          full_name: brokerProfile.full_name || "",
          email: brokerProfile.email || "",
          phone_number: brokerProfile.phone_number || "",
          company_name: brokerProfile.company_name || "",
          license_number: brokerProfile.license_number || "",
        });
      }

      // Load all mortgage profiles (clients)
      const mortgageProfiles = await fetchAllMortgageProfiles();
      setClients(mortgageProfiles);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      await saveMortgageBrokerProfile(user.id, formData);
      toast.success("Profile saved successfully");
      await loadData();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Mortgage Broker Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Manage your profile and view client mortgage applications
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Broker Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ""}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number || ""}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ""}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={formData.license_number || ""}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Enter your license number"
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-semibold">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clients Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clients ({clients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No clients have filled out mortgage profiles yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {client.full_name || "Name not provided"}
                        </h3>
                        <div className="mt-2 space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              {client.email}
                            </div>
                          )}
                          {client.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {client.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {client.credit_score_range && (
                          <div className="text-sm">
                            <span className="text-gray-600">Credit Score: </span>
                            <span className="font-semibold">{client.credit_score_range}</span>
                          </div>
                        )}
                        {client.purchase_price_range && (
                          <div className="text-sm">
                            <span className="text-gray-600">Budget: </span>
                            <span className="font-semibold">{client.purchase_price_range}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Left Corner - Account Actions */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/dashboard/settings"}
          className="bg-white shadow-md"
        >
          <User className="h-4 w-4 mr-2" />
          My Account
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = "/dashboard/settings"}
          className="bg-white shadow-md"
        >
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white shadow-md text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
