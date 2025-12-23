import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; session: Session | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, any>
  ) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateMetadata: (metadata: Record<string, any>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, any> = {}
  ) => {
    // Extract metadata from localStorage if available
    const signupData = localStorage.getItem("signupData");
    let combinedMetadata: Record<string, any> = { ...metadata };

    if (signupData) {
      try {
        const localData = JSON.parse(signupData);
        combinedMetadata = { ...combinedMetadata, ...localData };
        console.log("Using combined metadata:", combinedMetadata);
      } catch (e) {
        console.error("Error parsing signup data from localStorage:", e);
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: combinedMetadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // After successful signup, ensure profile is created
    if (data.user) {
      console.log("User created, checking profile...", {
        userId: data.user.id,
        metadata: data.user.user_metadata,
        rawMetadata: data.user.user_metadata
      });

      // Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Check if profile exists, if not create it
        const { data: existingProfile, error: checkError } = await supabase
          .from("user_profiles")
          .select("id, full_name")
          .eq("id", data.user.id)
          .maybeSingle();

        console.log("Profile check result:", { existingProfile, checkError });

        if (!existingProfile) {
          // Create profile manually if trigger didn't work
          const fullName =
            (metadata as any).full_name ||
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            null;

          console.log("Creating profile manually with fullName:", fullName);

          const { data: newProfile, error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              id: data.user.id,
              full_name: fullName,
              email: data.user.email || null,
            })
            .select()
            .single();

          if (profileError) {
            console.error(
              "Could not create profile automatically:",
              profileError,
              "Error details:",
              JSON.stringify(profileError, null, 2)
            );
          } else {
            console.log("Profile created successfully:", newProfile);
          }
        } else {
          // Profile exists, but check if full_name is missing
          if (!existingProfile.full_name) {
            const fullName =
              (metadata as any).full_name ||
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              null;

            if (fullName) {
              console.log("Updating profile with full_name:", fullName);
              const { error: updateError } = await supabase
                .from("user_profiles")
                .update({ full_name: fullName })
                .eq("id", data.user.id);

              if (updateError) {
                console.error("Could not update profile full_name:", updateError);
              } else {
                console.log("Profile full_name updated successfully");
              }
            }
          }
        }
      } catch (profileErr) {
        console.error("Error checking/creating profile:", profileErr);
      }
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const signInWithLinkedIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      throw error;
    }
  };

  const updateMetadata = async (metadata: Record<string, any>) => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithLinkedIn,
    resetPassword,
    updateMetadata,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
