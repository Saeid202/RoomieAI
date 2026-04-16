import { createContext, useContext, useEffect, useMemo, useState, startTransition } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client-simple";

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

  // Ensure a user_profiles row exists for the given user.
  // Safety net for cases where the DB trigger didn't fire
  // (e.g. existing OAuth users, trigger failures, etc.)
  const ensureProfile = async (user: User) => {
    try {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const meta = user.user_metadata ?? {};

        // Resolve first_name from multiple OAuth provider formats
        const firstName =
          meta.first_name ||
          meta.given_name ||
          (meta.full_name || meta.name || meta.display_name || "").split(" ")[0] ||
          "User";

        // Resolve last_name
        const lastName =
          meta.last_name ||
          meta.family_name ||
          (meta.full_name || meta.name || meta.display_name || "")
            .split(" ")
            .slice(1)
            .join(" ") ||
          "Unknown";

        await supabase.from("user_profiles").upsert(
          {
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email ?? "",
            role: meta.role ?? "seeker",
          } as any,
          { onConflict: "id" }
        );
      }
    } catch (err) {
      // Non-fatal — profile will be created on next login or by the trigger
      console.warn("ensureProfile failed:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initialSessionHandled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user?.id === user?.id && initialSessionHandled) {
        // Same user, same session — skip to avoid unnecessary re-renders
        startTransition(() => {
          setLoading(false);
        });
        return;
      }

      initialSessionHandled = true;
      startTransition(() => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      if (session?.user) {
        ensureProfile(session.user);
      }
    });

    // Get initial session to bootstrap — onAuthStateChange will also fire
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error?.message?.includes("Invalid Refresh Token")) {
        console.warn('Invalid refresh token detected, signing out...');
        supabase.auth.signOut();
        return;
      }

      // Only set if onAuthStateChange hasn't already handled it
      if (!initialSessionHandled) {
        initialSessionHandled = true;
        startTransition(() => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });

        if (session?.user) {
          ensureProfile(session.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide more helpful error messages
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        }
        if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw error;
      }

      return data;
    } catch (err: any) {
      // Handle network errors
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      }
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
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
        // Provide more helpful error messages
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        }
        if (error.message?.includes('User already registered')) {
          throw new Error('This email is already registered. Please sign in instead.');
        }
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
                role: (metadata as any).role || data.user.user_metadata?.role || 'seeker',
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
    } catch (err: any) {
      // Handle network errors
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Redirect to home page after successful logout
    window.location.href = '/';
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

  const value = useMemo(() => ({
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user?.id, session?.access_token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
