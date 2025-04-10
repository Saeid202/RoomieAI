
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PostgrestError } from "@supabase/supabase-js";

export function ProfileContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/');
      return;
    }

    // Load profile data from Supabase
    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Check if it's a PostgrestError with a code property
          const postgrestError = error as PostgrestError;
          // PGRST116 is "Not found" error, which is expected for new users
          if (postgrestError.code !== 'PGRST116') {
            throw error;
          }
        }

        if (data) {
          setProfileData(data);
        }
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate, toast]);

  const handleSaveProfile = async (formData: any) => {
    try {
      // Insert or update profile data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully",
      });

      // Refresh the profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setProfileData(data);
      }
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">My Profile</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <ProfileForm initialData={profileData} onSave={handleSaveProfile} />
          )}
        </div>
      </div>
    </div>
  );
}
