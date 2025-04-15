
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import { UserRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const LoginDialog = ({ isOpen, setIsOpen }: LoginDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithLinkedIn, resetPassword } = useAuth();
  const { setRole } = useRole();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting to sign in with:", email);
      const result = await signIn(email, password);
      
      setIsOpen(false);
      
      // Get user data to check role
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      // Log full user data for debugging
      console.log("Complete user data after login:", data);
      console.log("User metadata after login:", data.user?.user_metadata);
      
      const userRole = data.user?.user_metadata?.role as UserRole | undefined;
      console.log("User logged in with role:", userRole);
      
      // Set role in context
      if (userRole) {
        setRole(userRole);
        // Also update in localStorage
        localStorage.setItem('userRole', userRole);
      } else {
        console.warn("No role found in user metadata after login, checking localStorage...");
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        
        if (storedRole) {
          console.log("Using role from localStorage:", storedRole);
          setRole(storedRole);
        } else {
          console.warn("No role found in localStorage either, defaulting to seeker");
          setRole('seeker');
          localStorage.setItem('userRole', 'seeker');
        }
      }
      
      // Redirect based on user role
      if (userRole === 'landlord' || localStorage.getItem('userRole') === 'landlord') {
        navigate("/dashboard/landlord");
      } else if (userRole === 'developer' || localStorage.getItem('userRole') === 'developer') {
        navigate("/dashboard/developer");
      } else {
        // Default to profile dashboard for seekers
        navigate("/dashboard/profile");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back ${data.user?.email}!`,
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(forgotEmail);
      setShowForgotPassword(false);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions",
      });
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'linkedin') => {
    // Get role from localStorage if set from signup flow
    const pendingRole = localStorage.getItem('pendingRole');
    if (pendingRole) {
      console.log(`Social login with ${provider}, using role: ${pendingRole}`);
    } else {
      console.log(`Social login with ${provider}, no role specified`);
      // Default to seeker for social login
      localStorage.setItem('pendingRole', 'seeker');
    }
    
    if (provider === 'google') {
      signInWithGoogle();
    } else if (provider === 'facebook') {
      signInWithFacebook();
    } else if (provider === 'linkedin') {
      signInWithLinkedIn();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {showForgotPassword ? "Reset Password" : "Login to your account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showForgotPassword 
              ? "Enter your email to receive a password reset link"
              : "Welcome back to RoomieMatch! Enter your credentials to continue."}
          </DialogDescription>
        </DialogHeader>
        
        {showForgotPassword ? (
          <ForgotPasswordForm
            email={forgotEmail}
            setEmail={setForgotEmail}
            isLoading={isLoading}
            onSubmit={handleForgotPassword}
            onBackToLogin={() => setShowForgotPassword(false)}
          />
        ) : (
          <>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              onSubmit={handleLoginSubmit}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
            
            <div className="relative mt-6 mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <SocialLoginButtons
              onGoogleClick={() => handleSocialLogin('google')}
              onFacebookClick={() => handleSocialLogin('facebook')}
              onLinkedInClick={() => handleSocialLogin('linkedin')}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
