
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Set role from user metadata if available
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role as UserRole);
        console.log("Setting role from metadata:", session.user.user_metadata.role);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set role from user metadata if available
        if (session?.user?.user_metadata?.role) {
          setRole(session.user.user_metadata.role as UserRole);
          console.log("Auth change: setting role from metadata:", session.user.user_metadata.role);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setRole]);

  const signUp = async (email: string, password: string) => {
    return signUpWithEmail(email, password);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmail(email, password);
      
      // After successful sign in, check if user has a role in metadata
      const { data } = await supabase.auth.getUser();
      if (data.user?.user_metadata?.role) {
        setRole(data.user.user_metadata.role as UserRole);
        console.log("Sign in: setting role from metadata:", data.user.user_metadata.role);
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
