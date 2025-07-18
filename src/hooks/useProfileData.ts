import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { fetchProfileData, getTableNameFromPreference, saveProfileData } from "@/services/profileService";
import { TableName } from "@/components/dashboard/types/profileTypes";
import { mapDbRowToFormValues } from "@/utils/profileDataMappers";

export function useProfileData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPreference, setUserPreference] = useState<UserPreference>(null);
  const [activeTab, setActiveTab] = useState("personal-details");

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const savedPreference = localStorage.getItem('userPreference') as UserPreference;
    
    // Co-owner functionality has been removed, set preference to null
    setUserPreference(null);

    const loadProfileData = async () => {
      try {
        // Co-owner functionality has been removed
        setLoading(false);
        return;
      } catch (error: any) {
        console.error("Profile loading error:", error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, navigate, toast]);

  const handleSaveProfile = async (formData: ProfileFormValues) => {
    try {
      // Co-owner functionality has been removed
      toast({
        title: "Feature not available",
        description: "Profile saving has been disabled",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    profileData,
    loading,
    userPreference,
    navigate,
    activeTab,
    setActiveTab,
    handleSaveProfile
  };
}
