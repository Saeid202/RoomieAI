import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { verifyAdminAccess } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that ensures only verified admins can access
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return;
      
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const hasAdminAccess = await verifyAdminAccess();
        setIsAdmin(hasAdminAccess);
        
        if (!hasAdminAccess) {
          toast({
            title: "Access Denied",
            description: "You do not have administrator privileges",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading]);

  // Show loading state while checking
  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to admin login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin - redirect to regular dashboard
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verified admin - render children
  return <>{children}</>;
}
