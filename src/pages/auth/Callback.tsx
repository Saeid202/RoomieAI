
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRole } from '@/contexts/RoleContext';

export default function Callback() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  useEffect(() => {
    // Handle the OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Set role based on user metadata
        const userRole = session.user?.user_metadata?.role;
        if (userRole) {
          setRole(userRole);
          
          // Redirect based on role
          if (userRole === 'developer') {
            navigate('/dashboard/developer');
          } else if (userRole === 'landlord') {
            navigate('/dashboard/landlord');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Default to dashboard if no role is set
          navigate('/dashboard');
        }
      } else {
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
