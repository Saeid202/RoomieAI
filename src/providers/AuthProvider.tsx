
import { useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithOAuth, 
  resetPasswordForEmail, 
  signOutUser,
  updateUserMetadata
} from '@/services/authService';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/contexts/RoleContext';
import { toast } from '@/hooks/use-toast';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setRole } = useRole();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set role from user metadata if available
        if (session?.user?.user_metadata?.role) {
          const userRole = session.user.user_metadata.role as UserRole;
          console.log("Auth state change: setting role from metadata:", userRole);
          setRole(userRole);
          localStorage.setItem('userRole', userRole);
        } else {
          // Check localStorage as fallback
          const storedRole = localStorage.getItem('userRole') as UserRole | null;
          if (storedRole) {
            console.log("Auth state change: setting role from localStorage:", storedRole);
            setRole(storedRole);
            
            // Update user metadata if we're logged in but metadata is missing
            if (session?.user && !session.user.user_metadata?.role) {
              console.log("Updating missing role in user metadata");
              updateUserMetadata({ role: storedRole }).catch(error => 
                console.error("Failed to update user metadata:", error)
              );
            }
          }
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Retrieved existing session:", session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set role from user metadata if available
      if (session?.user?.user_metadata?.role) {
        const userRole = session.user.user_metadata.role as UserRole;
        console.log("Initial session: setting role from metadata:", userRole);
        setRole(userRole);
        localStorage.setItem('userRole', userRole);
      } else if (session?.user) {
        // If user is logged in but no role in metadata, check localStorage
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        if (storedRole) {
          console.log("Initial session: setting role from localStorage:", storedRole);
          setRole(storedRole);
          
          // Update user metadata to include the role
          console.log("Updating user metadata with missing role:", storedRole);
          updateUserMetadata({ role: storedRole }).catch(error => 
            console.error("Failed to update user metadata:", error)
          );
        } else {
          console.warn("No role found in metadata or localStorage, defaulting to seeker");
          setRole('seeker');
          localStorage.setItem('userRole', 'seeker');
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setRole]);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpWithEmail(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      const result = await signInWithEmail(email, password);
      
      // After successful sign in, check if user has a role in metadata
      const { data } = await supabase.auth.getUser();
      console.log("User data after login:", data.user);
      console.log("User metadata:", data.user?.user_metadata);
      
      if (data.user?.user_metadata?.role) {
        const userRole = data.user.user_metadata.role as UserRole;
        console.log("Sign in: setting role from metadata:", userRole);
        setRole(userRole);
        localStorage.setItem('userRole', userRole);
      } else {
        // Check localStorage as fallback
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        if (storedRole) {
          console.log("Sign in: using role from localStorage:", storedRole);
          setRole(storedRole);
          
          // Update user metadata
          console.log("Updating user metadata with role from localStorage");
          await updateUserMetadata({ role: storedRole });
        } else {
          console.warn("No role found in user metadata or localStorage, defaulting to seeker");
          setRole('seeker');
          localStorage.setItem('userRole', 'seeker');
          
          // Update user metadata
          await updateUserMetadata({ role: 'seeker' });
        }
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    return signInWithOAuth('google');
  };

  const signInWithFacebook = async () => {
    return signInWithOAuth('facebook');
  };

  const signInWithLinkedIn = async () => {
    return signInWithOAuth('linkedin');
  };

  const resetPassword = async (email: string) => {
    return resetPasswordForEmail(email);
  };

  const signOut = async () => {
    return signOutUser();
  };

  const updateMetadata = async (metadata: Record<string, any>) => {
    return updateUserMetadata(metadata);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signInWithLinkedIn,
        resetPassword,
        signOut,
        updateMetadata,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
