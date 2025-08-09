
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CoOwnerFormValues } from "@/components/dashboard/co-owner/types";
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;

export function useCoOwnerProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<CoOwnerFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load profile data when user changes
  useEffect(() => {
    async function loadCoOwnerProfile() {
      // Clear any previous errors
      setError(null);
      
      // Wait for auth to complete before checking user
      if (authLoading) {
        console.log("Auth is still loading, waiting...");
        return;
      }

      if (!user) {
        console.log("No authenticated user found");
        setLoading(false);
        setError("Please login to view your profile");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching co-owner profile for user:", user.id);
        
        const { data, error: fetchError } = await sb
          .from('co_owner')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching co-owner profile:', fetchError);
          
          // Provide more specific error message based on error code
          if (fetchError.code === 'PGRST116') {
            setError("No profile found. Please complete your profile.");
          } else if (fetchError.code === '42P01') {
            setError("Database table doesn't exist. Please contact support.");
          } else {
            setError(fetchError.message);
          }
          
          // Only show toast for actual errors, not for "no data found"
          if (fetchError.code !== 'PGRST116') {
            toast({
              title: 'Error',
              description: 'Failed to load your co-owner profile. ' + fetchError.message,
              variant: 'destructive',
            });
          }
          
          setProfileData(null);
        } else if (data) {
          console.log("Found profile data:", data);
          
          // Map database fields to form fields with proper type assertions
          const formData: CoOwnerFormValues = {
            fullName: data.full_name || "",
            age: data.age ? String(data.age) : "",
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            occupation: data.occupation || "",
            preferredLocation: data.preferred_location || "",
            investmentCapacity: data.investment_capacity || [100000, 500000],
            investmentTimeline: (data.investment_timeline as "0-6 months" | "6-12 months" | "1-2 years" | "2+ years") || "0-6 months",
            propertyType: (data.property_type as "House" | "Apartment" | "Condo" | "Townhouse" | "Multi-family" | "Any") || "Any",
            coOwnershipExperience: (data.co_ownership_experience as "None" | "Some" | "Extensive") || "None",
          };
          
          setProfileData(formData);
          setError(null);
        } else {
          console.log("No profile data found for user:", user.id);
          setProfileData(null);
          setError("No profile found. Please complete your profile.");
        }
      } catch (error) {
        console.error('Error in loadCoOwnerProfile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: 'Failed to load your co-owner profile. ' + errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    loadCoOwnerProfile();
  }, [user, authLoading, toast]);

  const saveProfile = async (formData: CoOwnerFormValues) => {
    if (!user) {
      const errorMsg = "You must be logged in to save your profile.";
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log("Saving co-owner profile for user:", user.id);
      console.log("Form data to save:", formData);
      
      const profileData = {
        user_id: user.id,
        full_name: formData.fullName,
        age: parseInt(formData.age),
        email: formData.email,
        phone_number: formData.phoneNumber,
        occupation: formData.occupation,
        preferred_location: formData.preferredLocation,
        investment_capacity: formData.investmentCapacity,
        investment_timeline: formData.investmentTimeline,
        property_type: formData.propertyType,
        co_ownership_experience: formData.coOwnershipExperience,
        updated_at: new Date().toISOString(),
      };

      const { error: saveError } = await sb
        .from('co_owner')
        .upsert(profileData)
        .select();

      if (saveError) {
        throw saveError;
      }

      // Update local state with the new data
      setProfileData(formData);
      setError(null);
      
      toast({
        title: 'Success',
        description: 'Your co-owner profile has been saved.',
      });
      
      return { success: true, data: formData };
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to save your co-owner profile. ' + errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    profileData,
    loading,
    error,
    saveProfile
  };
}
