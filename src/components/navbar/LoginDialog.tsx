
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

interface LoginDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const LoginDialog = ({ isOpen, setIsOpen }: LoginDialogProps) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithLinkedIn, resetPassword } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      setIsOpen(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      alert("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPassword(forgotEmail);
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
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
              onGoogleClick={signInWithGoogle}
              onFacebookClick={signInWithFacebook}
              onLinkedInClick={signInWithLinkedIn}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
