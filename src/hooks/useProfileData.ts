import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormValues } from "@/types/profile";
import { UserPreference } from "@/components/dashboard/types";
import { fetchProfileData, getTableNameFromPreference, saveProfileData } from "@/services/profileService";
import { TableName } from "@/components/dashboard/types/profileTypes";
import { mapDbRowToFormValues, mapCoOwnerDbRowToFormValues } from "@/utils/profileDataMappers";

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
    
    const validPreference = savedPreference === 'co-owner' ? savedPreference : null;
    setUserPreference(validPreference);

    const loadProfileData = async () => {
      try {
        if (!validPreference) {
          setLoading(false);
          return;
        }

        const tableName = getTableNameFromPreference(validPreference);
        if (!tableName) {
          setLoading(false);
          return;
        }

        const { data, error } = await fetchProfileData(user.id, tableName);

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error("Error fetching profile data:", error);
            throw error;
          }
        }

        if (data) {
          console.log("Fetched data:", data);
          let formattedData;
          
          if (validPreference === 'co-owner') {
            formattedData = mapCoOwnerDbRowToFormValues(data);
          } else {
            formattedData = mapDbRowToFormValues(data);
          }
          
          setProfileData(formattedData);
        }
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
      if (!user || !userPreference) return;
      
      console.log("Saving profile for user:", user.id);
      console.log("Selected preference:", userPreference);
      console.log("Form data to save:", formData);
      
      const tableName = getTableNameFromPreference(userPreference);
      if (!tableName) {
        throw new Error("No table selected. Please select a preference (roommate or co-owner).");
      }

      const result = await saveProfileData(formData, user.id, tableName);
      
      if (result.error) {
        console.error("Error saving profile:", result.error);
        throw result.error;
      }

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      window.location.reload();
      
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
