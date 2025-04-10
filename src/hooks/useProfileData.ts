
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
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Get user preference from localStorage
    const savedPreference = localStorage.getItem('userPreference') as UserPreference;
    setUserPreference(savedPreference);

    // Load profile data from Supabase based on preference
    const loadProfileData = async () => {
      try {
        if (!savedPreference) {
          setLoading(false);
          return;
        }

        // Determine which table to query based on user preference
        const tableName = getTableNameFromPreference(savedPreference);
        if (!tableName) {
          setLoading(false);
          return;
        }

        // Fetch the profile data
        const { data, error } = await fetchProfileData(user.id, tableName);

        if (error) {
          // Check if it's a PostgrestError with a code property
          if (error.code !== 'PGRST116') { // PGRST116 is "Not found" error, which is expected for new users
            console.error("Error fetching profile data:", error);
            throw error;
          }
        }

        if (data) {
          console.log("Fetched data:", data);
          // Convert database row to form values format
          const formattedData = mapDbRowToFormValues(data);
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
      
      // Determine which table to save to based on user preference
      const tableName = getTableNameFromPreference(userPreference);
      if (!tableName) {
        throw new Error("No table selected. Please select a preference (roommate, co-owner, or both).");
      }

      // Save the profile data
      const result = await saveProfileData(formData, user.id, tableName);
      
      if (result.error) {
        console.error("Error saving profile:", result.error);
        throw result.error;
      }

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the page to show updated data
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
