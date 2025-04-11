
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  try {
    // Extract metadata from localStorage if available
    const signupData = localStorage.getItem('signupData');
    let metadata = {};
    
    if (signupData) {
      try {
        metadata = JSON.parse(signupData);
        console.log("Using signup metadata from localStorage:", metadata);
      } catch (e) {
        console.error("Error parsing signup data from localStorage:", e);
      }
    }
    
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    console.log("Signup response:", data);
    console.log("User metadata set during signup:", metadata);
    
    // Clear signup data from localStorage after successful signup
    localStorage.removeItem('signupData');
    
    toast({
      title: "Success",
      description: "Check your email for the confirmation link. It may take a few minutes to arrive.",
    });
    
    return data;
  } catch (error: any) {
    console.error("Signup error:", error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    console.log("Attempting to sign in with:", email);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    
    console.log("Sign in successful:", data.user?.email);
    console.log("User metadata:", data.user?.user_metadata);
    
    toast({
      title: "Success",
      description: "You've signed in successfully",
    });
    
    return data;
  } catch (error: any) {
    console.error("Login error:", error);
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
}

// Sign in with OAuth providers
export async function signInWithOAuth(provider: 'google' | 'facebook' | 'linkedin') {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}

// Reset password
export async function resetPasswordForEmail(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Check your email for the password reset link",
    });
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}

// Sign out
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "You've signed out successfully",
    });
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}
