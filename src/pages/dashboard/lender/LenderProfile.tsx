import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-simple";
import { getLenderProfile, createLenderProfile, updateLenderProfile } from "@/services/lenderService";
import { LenderProfile as LenderProfileType, CreateLenderProfileInput } from "@/types/lender";
import { Building2, Mail, Phone, Globe, FileText, MapPin } from "lucide-react";

export default function LenderProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<LenderProfileType | null>(null);
  const [formData, setFormData] = useState<CreateLenderProfileInput>({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    website_url: "",
    license_number: "",
    license_state: "",
    nmls_id: "",
    company_address: "",
    company_city: "",
    company_province: "",
    company_postal_code: "",
    company_description: "",
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

      const lenderProfile = await getLenderProfile(user.id);
      if (lenderProfile) {
        setProfile(lenderProfile);
        setFormData({
          company_name: lenderProfile.company_name || "",
          contact_email: lenderProfile.contact_email || "",
          contact_phone: lenderProfile.contact_phone || "",
          website_url: lenderProfile.website_url || "",
          license_number: lenderProfile.license_number || "",
          license_state: lenderProfile.license_state || "",
          nmls_id: lenderProfile.nmls_id || "",
          company_address: lenderProfile.company_address || "",
          company_city: lenderProfile.company_city || "",
          company_province: lenderProfile.company_province || "",
          company_postal_code: lenderProfile.company_postal_code || "",
          company_description: lenderProfile.company_description || "",
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

      if (!formData.company_name || !formData.contact_email) {
        toast.error("Company name and email are required");
        return;
      }

      if (profile) {
        await updateLenderProfile(profile.id, formData);
      } else {
        await createLenderProfile(user.id, formData);
      }
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
    <div className="w-full px-4 space-y-6 pb-10">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Lender Profile
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              Update your company information
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-6 relative z-10 space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Company Name <span className="text-pink-600">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Enter your company name"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Mail className="h-4 w-4 text-purple-600" />
                  Contact Email <span className="text-pink-600">*</span>
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="your.email@company.com"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Phone className="h-4 w-4 text-purple-600" />
                  Contact Phone
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website_url" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <Globe className="h-4 w-4 text-purple-600" />
                  Website URL
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url || ""}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://www.yourcompany.com"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* License Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number" className="flex items-center gap-2 text-gray-900 font-semibold">
                    <FileText className="h-4 w-4 text-purple-600" />
                    License Number
                  </Label>
                  <Input
                    id="license_number"
                    value={formData.license_number || ""}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="Enter license number"
                    disabled={saving}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_state" className="flex items-center gap-2 text-gray-900 font-semibold">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    License State/Province
                  </Label>
                  <Input
                    id="license_state"
                    value={formData.license_state || ""}
                    onChange={(e) => setFormData({ ...formData, license_state: e.target.value })}
                    placeholder="e.g., ON, CA, NY"
                    disabled={saving}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
              </div>

              {/* NMLS ID */}
              <div className="space-y-2">
                <Label htmlFor="nmls_id" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <FileText className="h-4 w-4 text-purple-600" />
                  NMLS ID
                </Label>
                <Input
                  id="nmls_id"
                  value={formData.nmls_id || ""}
                  onChange={(e) => setFormData({ ...formData, nmls_id: e.target.value })}
                  placeholder="Enter NMLS ID"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              {/* Company Address */}
              <div className="space-y-2">
                <Label htmlFor="company_address" className="flex items-center gap-2 text-gray-900 font-semibold">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  Company Address
                </Label>
                <Input
                  id="company_address"
                  value={formData.company_address || ""}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  placeholder="Street address"
                  disabled={saving}
                  className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_city" className="text-gray-900 font-semibold">City</Label>
                  <Input
                    id="company_city"
                    value={formData.company_city || ""}
                    onChange={(e) => setFormData({ ...formData, company_city: e.target.value })}
                    placeholder="City"
                    disabled={saving}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_province" className="text-gray-900 font-semibold">Province</Label>
                  <Input
                    id="company_province"
                    value={formData.company_province || ""}
                    onChange={(e) => setFormData({ ...formData, company_province: e.target.value })}
                    placeholder="Province"
                    disabled={saving}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_postal_code" className="text-gray-900 font-semibold">Postal Code</Label>
                  <Input
                    id="company_postal_code"
                    value={formData.company_postal_code || ""}
                    onChange={(e) => setFormData({ ...formData, company_postal_code: e.target.value })}
                    placeholder="Postal code"
                    disabled={saving}
                    className="border-2 border-purple-200 focus:border-purple-500 bg-white/90"
                  />
                </div>
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <Label htmlFor="company_description" className="text-gray-900 font-semibold">
                  Company Description
                </Label>
                <textarea
                  id="company_description"
                  value={formData.company_description || ""}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  placeholder="Tell borrowers about your company..."
                  disabled={saving}
                  rows={4}
                  className="w-full p-3 border-2 border-purple-200 focus:border-purple-500 bg-white/90 rounded-md resize-none"
                />
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

        {/* Stats Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl sticky top-4">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
            <CardContent className="p-4 relative z-10">
              <h3 className="text-lg font-black text-gray-900 mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
                <div className="flex items-center justify-between p-3 bg-white/80 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Verified</span>
                  <span className={`text-sm font-bold ${profile?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profile?.is_verified ? 'Yes' : 'Pending'}
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
