
import { useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/contexts/AuthContext';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithOAuth, 
  resetPasswordForEmail, 
  signOutUser 
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
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setRole]);

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpWithEmail(email, password);
      toast({
        title: "Check your email",
        description: "Please check your email for a confirmation link. If you don't see it, check your spam folder.",
      });
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
      } else {
        console.warn("No role found in user metadata, defaulting to seeker");
        // Default to seeker if no role is found
        setRole('seeker');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
