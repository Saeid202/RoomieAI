import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchMortgageBrokerProfile, 
  saveMortgageBrokerProfile
} from "@/services/mortgageBrokerService";
import { MortgageBrokerProfile as MortgageBrokerProfileType, MortgageBrokerFormData } from "@/types/mortgageBroker";
import { User, Building2, Mail, Phone, FileText } from "lucide-react";

export default function MortgageBrokerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MortgageBrokerProfileType | null>(null);
  const [formData, setFormData] = useState<MortgageBrokerFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    company_name: "",
    license_number: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

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
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
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
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-6 pb-10">
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
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Broker Profile
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              Update your professional information
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form - Left Aligned with Organizational Colors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form - Takes 3 columns */}
        <div className="lg:col-span-3">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-6 relative z-10 space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <User className="h-4 w-4 text-purple-600" />
                  Full Name <span className="text-pink-600">*</span>
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ""}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Mail className="h-4 w-4 text-purple-600" />
                  Email <span className="text-pink-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Phone Number <span className="text-pink-600">*</span>
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number || ""}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ""}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Enter your company name"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <Label htmlFor="license_number" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <FileText className="h-4 w-4 text-purple-600" />
                  License Number
                </Label>
                <Input
                  id="license_number"
                  value={formData.license_number || ""}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Enter your license number"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
                <p className="text-xs text-gray-600 font-medium">
                  Your professional mortgage broker license number
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar - Takes 1 column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl sticky top-4">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-4 relative z-10">
              <h3 className="text-lg font-black text-gray-900 mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Profile Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Completion</span>
                  <span className="text-lg font-black text-purple-600">
                    {profile ? '100%' : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Status</span>
                  <span className="text-sm font-bold text-green-600">
                    {profile ? 'Active' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
