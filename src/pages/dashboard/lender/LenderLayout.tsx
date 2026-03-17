import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LenderSidebar } from "@/components/dashboard/sidebar/LenderSidebar";
import { toast } from "sonner";

interface LenderLayoutProps {
  children: React.ReactNode;
}

export default function LenderLayout({ children }: LenderLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('lender_profiles')
        .select('id, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) {
        // User doesn't have a lender profile yet
        navigate('/dashboard/lender/profile');
        return;
      }

      if (!profile.is_active) {
        toast.error("Your lender account is not active. Please contact support.");
        navigate('/dashboard');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Error checking authorization:", error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LenderSidebar
        isActive={(path) => location.pathname === path || location.pathname.startsWith(path + '/')}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}