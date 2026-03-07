import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchLawyerProfile, updateLawyerProfile } from "@/services/lawyerService";
import { LawyerFormData, PRACTICE_AREAS, PROVINCES } from "@/types/lawyer";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LawyerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LawyerFormData>({
    full_name: null,
    email: null,
    phone_number: null,
    law_firm_name: null,
    bar_association_number: null,
    practice_areas: [],
    years_of_experience: null,
    hourly_rate: null,
    consultation_fee: null,
    bio: null,
    city: null,
    province: null,
    is_accepting_clients: true,
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

      const profile = await fetchLawyerProfile(user.id);
      if (profile) {
        setFormData({
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          law_firm_name: profile.law_firm_name,
          bar_association_number: profile.bar_association_number,
          practice_areas: profile.practice_areas || [],
          years_of_experience: profile.years_of_experience,
          hourly_rate: profile.hourly_rate,
          consultation_fee: profile.consultation_fee,
          bio: profile.bio,
          city: profile.city,
          province: profile.province,
          is_accepting_clients: profile.is_accepting_clients,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      await updateLawyerProfile(user.id, formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const togglePracticeArea = (area: string) => {
    const current = formData.practice_areas || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    setFormData({ ...formData, practice_areas: updated });
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Lawyer Profile
        </h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@lawfirm.com"
              />
            </div>
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number || ""}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="law_firm_name">Law Firm Name</Label>
              <Input
                id="law_firm_name"
                value={formData.law_firm_name || ""}
                onChange={(e) => setFormData({ ...formData, law_firm_name: e.target.value })}
                placeholder="Doe & Associates"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bar_association_number">Bar Association Number</Label>
              <Input
                id="bar_association_number"
                value={formData.bar_association_number || ""}
                onChange={(e) => setFormData({ ...formData, bar_association_number: e.target.value })}
                placeholder="BAR123456"
              />
            </div>
            <div>
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                value={formData.years_of_experience || ""}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || null })}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate || ""}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || null })}
                placeholder="250.00"
              />
            </div>
            <div>
              <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
              <Input
                id="consultation_fee"
                type="number"
                step="0.01"
                value={formData.consultation_fee || ""}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || null })}
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <Label>Practice Areas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {PRACTICE_AREAS.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.practice_areas?.includes(area) || false}
                    onCheckedChange={() => togglePracticeArea(area)}
                  />
                  <Label htmlFor={area} className="cursor-pointer">{area}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients about your experience and expertise..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Toronto"
              />
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Select
                value={formData.province || ""}
                onValueChange={(value) => setFormData({ ...formData, province: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_accepting_clients"
              checked={formData.is_accepting_clients || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_accepting_clients: checked as boolean })}
            />
            <Label htmlFor="is_accepting_clients" className="cursor-pointer">
              Currently accepting new clients
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
