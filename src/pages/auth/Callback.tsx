
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRole, UserRole } from '@/contexts/RoleContext';
import { toast } from '@/hooks/use-toast';

export default function Callback() {
  const navigate = useNavigate();
  const { refreshRole } = useRole();

  // Helper function to validate if a role is one of the expected values
  function isValidRole(role: any): boolean {
    const validRoles: UserRole[] = ['seeker', 'landlord'];
    return validRoles.includes(role as UserRole);
  }

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        console.log("Auth callback - session exists:", session.user.email);
        
        // Get user metadata which should contain role
        const userRole = session.user?.user_metadata?.role;
        console.log("Auth callback - role from metadata:", userRole);
        
        // Get any pending role from localStorage (for social sign-in flows)
        const pendingRole = localStorage.getItem('pendingRole');
        console.log("Auth callback - pending role from localStorage:", pendingRole);
        
        let effectiveRole: UserRole;
        
        // Determine which role to use and assign to database
        if (userRole && isValidRole(userRole)) {
          console.log("Auth callback - using role from metadata:", userRole);
          effectiveRole = userRole as UserRole;
        } else if (pendingRole && isValidRole(pendingRole)) {
          console.log("Auth callback - using pending role:", pendingRole);
          effectiveRole = pendingRole as UserRole;
          
          // Update user metadata with the role from localStorage
          try {
            await supabase.auth.updateUser({
              data: { role: effectiveRole }
            });
          } catch (err) {
            console.error("Exception updating user metadata:", err);
          }
        } else {
          // Default to seeker if no valid role found
          console.log("Auth callback - no valid role found, defaulting to seeker");
          effectiveRole = 'seeker';
          
          // Update user metadata with default role
          try {
            await supabase.auth.updateUser({
              data: { role: effectiveRole }
            });
          } catch (err) {
            console.error("Exception setting default role:", err);
          }
        }
        
        // Assign role in database table
        try {
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: session.user.id,
              role: effectiveRole
            });
          
          if (error && !error.message.includes('duplicate')) {
            console.error("Error inserting user role:", error);
          }
        } catch (err) {
          console.error("Exception inserting user role:", err);
        }
        
        // Refresh role context from server
        await refreshRole();
        
        // Clear pending role
        localStorage.removeItem('pendingRole');
        
        // Redirect based on role
        console.log("Auth callback - redirecting based on role:", effectiveRole);
        
        if (effectiveRole === 'landlord') {
          navigate('/dashboard/landlord');
        } else {
          navigate('/dashboard/profile');
        }
      } else {
        console.log("Auth callback - no session found");
        navigate('/');
      }
    });
  }, [navigate, refreshRole]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing authentication...</h2>
        <div className="animate-spin h-8 w-8 border-4 border-roomie-purple border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
