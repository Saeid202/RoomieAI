
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { CoOwnerProfileForm } from "./CoOwnerProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PersonalDetailsForm() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCoOwnerProfile() {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('co-owner')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching co-owner profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your co-owner profile.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCoOwnerProfile();
  }, [user, toast]);

  const handleSaveCoOwnerProfile = async (formData) => {
    if (!user) return;

    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('co-owner')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Prepare data for insert/update
      const profileData = {
        ...formData,
        user_id: user.id,
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('co-owner')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('co-owner')
          .insert(profileData);
      }

      if (result.error) {
        throw result.error;
      }

      // Changed from returning boolean to void
      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
    } catch (error) {
      console.error('Error saving co-owner profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your co-owner profile.',
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
