
import { supabase } from '@/integrations/supabase/client';
import { ToastProps } from '@/components/ui/toast';

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string,
  showToast: (props: ToastProps) => void
) {
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    showToast({
      title: "Success",
      description: "Check your email for the confirmation link",
    });
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string, 
  password: string,
  showToast: (props: ToastProps) => void
) {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast({
      title: "Success",
      description: "You've signed in successfully",
    });
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
}

// Sign in with OAuth providers
export async function signInWithOAuth(
  provider: 'google' | 'facebook' | 'linkedin',
  showToast: (props: ToastProps) => void
) {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}

// Reset password
export async function resetPasswordForEmail(
  email: string,
  showToast: (props: ToastProps) => void
) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    showToast({
      title: "Success",
      description: "Check your email for the password reset link",
    });
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}

// Sign out
export async function signOutUser(showToast: (props: ToastProps) => void) {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    showToast({
      title: "Success",
      description: "You've signed out successfully",
    });
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}
