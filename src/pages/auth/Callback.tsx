
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';
import { toast } from '@/hooks/use-toast';

export default function Callback() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        console.log("Auth callback - session exists:", session.user.email);
        console.log("Auth callback - user metadata:", session.user.user_metadata);
        
        // Get any pending role from localStorage
        const pendingRole = localStorage.getItem('pendingRole');
        
        // First check if role exists in metadata
        const userRole = session.user?.user_metadata?.role;
        
        if (userRole) {
          console.log("Auth callback - using role from metadata:", userRole);
          setRole(userRole);
          localStorage.setItem('userRole', userRole);
        } else if (pendingRole) {
          // If no role in metadata but we have a pending role, update it
          console.log("Auth callback - setting pending role:", pendingRole);
          setRole(pendingRole);
          localStorage.setItem('userRole', pendingRole);
          
          // Update user metadata
          try {
            const { data, error } = await supabase.auth.updateUser({
              data: { role: pendingRole }
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
          // Default to seeker if no role information available
          console.log("Auth callback - no role found, defaulting to seeker");
          setRole('seeker');
          localStorage.setItem('userRole', 'seeker');
          
          // Update user metadata
          try {
            const { error } = await supabase.auth.updateUser({
              data: { role: 'seeker' }
            });
            
            if (error) {
              console.error("Error setting default role:", error);
            }
          } catch (err) {
            console.error("Exception setting default role:", err);
          }
        }
        
        // Clear pending role
        localStorage.removeItem('pendingRole');
        
        // Redirect based on role
        const effectiveRole = userRole || pendingRole || 'seeker';
        
        if (effectiveRole === 'developer') {
          navigate('/dashboard/developer');
        } else if (effectiveRole === 'landlord') {
          navigate('/dashboard/landlord');
        } else {
          navigate('/dashboard/profile');
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
