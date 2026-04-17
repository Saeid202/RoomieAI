
import { useEffect, useState, startTransition } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client-simple";

interface RoleInitializerProps {
  children: React.ReactNode;
}

export function RoleInitializer({ children }: RoleInitializerProps) {
  const { role, setRole } = useRole();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      startTransition(() => {
        setIsLoading(false);
      });
      return;
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("⏱️ RoleInitializer - Timeout reached, forcing load completion");
      startTransition(() => {
        setIsLoading(false);
        // If role is still null after timeout, set a default
        if (!role) {
          const fallbackRole = user.user_metadata?.role || 'seeker';
          console.log("⚠️ RoleInitializer - Setting fallback role after timeout:", fallbackRole);
          setRole(fallbackRole);
        }
      });
    }, 5000); // 5 second timeout

    const loadUserRole = async () => {
      try {
        console.log("🔍 RoleInitializer - Starting role load for user:", user.id);
        console.log("🔍 RoleInitializer - User metadata:", user.user_metadata);

        // ALWAYS fetch from database first (more reliable than metadata)
        console.log("🔍 RoleInitializer - Fetching role from database...");
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        let userRole;

        if (error) {
          console.error("❌ RoleInitializer - Error fetching role from database:", error);
          // Fallback to metadata if database fails
          userRole = user.user_metadata?.role || 'seeker';
          console.log("⚠️ RoleInitializer - Using metadata fallback:", userRole);
        } else if (profile?.role) {
          userRole = profile.role;
          console.log("✅ RoleInitializer - Loaded role from database:", userRole);
          
          // Convert tenant to seeker if found in database
          if (userRole === 'tenant') {
            console.log("RoleInitializer - Converting tenant to seeker in database...");
            await supabase
              .from('user_profiles')
              .update({ role: 'seeker' })
              .eq('id', user.id);
            userRole = 'seeker';
            console.log("RoleInitializer - Converted to seeker:", userRole);
          }
        } else {
          // profile.role is null — fall back to auth metadata, then default
          userRole = user.user_metadata?.role || 'seeker';
          console.warn("⚠️ RoleInitializer - profile.role is null, using metadata:", userRole);

          // Also patch DB to convert tenant to seeker permanently
          if (userRole === 'tenant') {
            supabase
              .from('user_profiles')
              .update({ role: 'seeker' })
              .eq('id', user.id)
              .then(({ error: updateError }) => {
                if (updateError) console.error("❌ RoleInitializer - Failed to convert tenant to seeker:", updateError);
                else console.log("✅ RoleInitializer - Converted tenant to seeker in DB:", user.id);
              });
          } else if (!userRole || userRole === 'seeker') {
            // Handle null roles or already seeker
            supabase
              .from('user_profiles')
              .update({ role: 'seeker' })
              .eq('id', user.id)
              .then(({ error: updateError }) => {
                if (updateError) console.error("❌ RoleInitializer - Failed to patch null role:", updateError);
                else console.log("✅ RoleInitializer - Patched null role in DB to: seeker");
              });
          }
        }

        // CRITICAL: Set role from database (already converted to seeker if was tenant)
        console.log("RoleInitializer - Setting role to context:", userRole);
        startTransition(() => {
          setRole(userRole);
        });
      } catch (error) {
        console.error("RoleInitializer - Error loading role:", error);
        // Set fallback role on error
        const fallbackRole = user.user_metadata?.role || 'seeker';
        console.log("RoleInitializer - Setting fallback role after error:", fallbackRole);
        startTransition(() => {
          setRole(fallbackRole);
        });
      } finally {
        clearTimeout(timeoutId);
        startTransition(() => {
          setIsLoading(false);
        });
      }
    };

    loadUserRole();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [user?.id]); // Only depend on user ID, not metadata

  // Show loading state while fetching role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
