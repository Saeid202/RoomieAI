
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { useToast } from "@/hooks/use-toast";
import { CoOwnerFormValues } from "./types";
import { initializeDatabase, fetchCoOwnerProfile, saveCoOwnerProfile } from "@/services/databaseService";

export function PersonalDetailsForm() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the database when component mounts
    initializeDatabase();
  }, []);

  useEffect(() => {
    async function loadCoOwnerProfile() {
      if (!user) {
        console.log("No user found when trying to fetch profile");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching co-owner profile for user:", user.id);
        
        const data = await fetchCoOwnerProfile(user.id);
        
        if (data) {
          console.log("Found profile data:", data);
          setProfileData(data);
        } else {
          console.log("No profile data found for user:", user.id);
        }
      } catch (error) {
        console.error('Error fetching co-owner profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your co-owner profile. ' + (error.message || ''),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadCoOwnerProfile();
  }, [user, toast]);

  const handleSaveCoOwnerProfile = async (formData: CoOwnerFormValues) => {
    if (!user) {
      console.error("No user found when trying to save profile");
      toast({
        title: 'Error',
        description: 'You must be logged in to save your profile.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Saving co-owner profile for user:", user.id);
      console.log("Form data to save:", formData);
      
      const result = await saveCoOwnerProfile(formData, user.id);
      
      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
      
      // Update the profile data state with the newly saved data
      if (result && result.data && result.data[0]) {
        setProfileData(result.data[0]);
      }
      
    } catch (error) {
      console.error('Error saving co-owner profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your co-owner profile. ' + (error.message || ''),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Loading your profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CoOwnerProfileForm 
        initialData={profileData} 
        onSave={handleSaveCoOwnerProfile} 
      />
    </div>
  );
}
