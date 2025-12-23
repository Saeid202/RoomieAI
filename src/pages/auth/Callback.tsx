
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { toast } from '@/hooks/use-toast';

export default function Callback() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  // Helper function to validate if a role is one of the expected values
  function isValidRole(role: any): boolean {
    const validRoles: UserRole[] = ['seeker', 'landlord', 'renovator'];
    return validRoles.includes(role as UserRole);
  }

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        console.log("Auth callback - session exists:", session.user.email);

        // Ensure profile exists for the user
        try {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .eq('id', session.user.id)
            .single();

          if (!existingProfile) {
            // Create profile if it doesn't exist
            const fullName = session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.user_metadata?.display_name ||
              null;

            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: session.user.id,
                full_name: fullName,
                email: session.user.email || null,
              });

            if (profileError) {
              console.warn("Could not create profile in callback:", profileError);
            } else {
              console.log("Profile created successfully in callback");
            }
          } else if (!existingProfile.full_name && session.user.user_metadata?.full_name) {
            // Update profile if full_name is missing
            await supabase
              .from('user_profiles')
              .update({
                full_name: session.user.user_metadata.full_name,
                email: session.user.email || existingProfile.email,
              })
              .eq('id', session.user.id);
          }
        } catch (profileErr) {
          console.warn("Error checking/creating profile in callback:", profileErr);
        }

        // Get user metadata which should contain role
        const userRole = session.user?.user_metadata?.role;
        console.log("Auth callback - role from metadata:", userRole);

        // Get any pending role from localStorage (for social sign-in flows)
        const pendingRole = localStorage.getItem('pendingRole');
        console.log("Auth callback - pending role from localStorage:", pendingRole);

        let effectiveRole: UserRole;

        // Determine which role to use, prioritize metadata over localStorage
        if (userRole && isValidRole(userRole)) {
          console.log("Auth callback - using role from metadata:", userRole);
          effectiveRole = userRole as UserRole;
          setRole(effectiveRole);
          localStorage.setItem('userRole', effectiveRole);
        } else if (pendingRole && isValidRole(pendingRole)) {
          console.log("Auth callback - using pending role:", pendingRole);
          effectiveRole = pendingRole as UserRole;
          setRole(effectiveRole);
          localStorage.setItem('userRole', effectiveRole);

          // Update user metadata with the role from localStorage
          try {
            const { data, error } = await supabase.auth.updateUser({
              data: { role: effectiveRole }
            });

            if (error) {
              console.error("Error updating user metadata:", error);
              toast({
                title: "Warning",
                description: "Failed to set your user role. Some features may be limited.",
                variant: "destructive",
              });
            } else {
              console.log("Successfully updated user metadata with role:", data.user.user_metadata);
            }
          } catch (err) {
            console.error("Exception updating user metadata:", err);
          }
        } else {
          // Default to seeker if no valid role found
          console.log("Auth callback - no valid role found, defaulting to seeker");
          effectiveRole = 'seeker';
          setRole(effectiveRole);
          localStorage.setItem('userRole', effectiveRole);

          // Update user metadata with default role
          try {
            await supabase.auth.updateUser({
              data: { role: effectiveRole }
            });
          } catch (err) {
            console.error("Exception setting default role:", err);
          }
        }

        // Clear pending role
        localStorage.removeItem('pendingRole');

        // Redirect based on role
        console.log("Auth callback - redirecting based on role:", effectiveRole);

        if (effectiveRole === 'landlord') {
          navigate('/dashboard/landlord');
        } else {
          navigate('/dashboard/roommate-recommendations');
        }
      } else {
        console.log("Auth callback - no session found");
        navigate('/');
      }
    });
  }, [navigate, setRole]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing authentication...</h2>
        <div className="animate-spin h-8 w-8 border-4 border-roomie-purple border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
