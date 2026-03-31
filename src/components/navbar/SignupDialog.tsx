
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
import { SignupForm, SignupFormValues } from "@/components/auth/SignupForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { toast } from "@/hooks/use-toast";
import { UserRole } from "@/contexts/RoleContext";
import { useRole } from "@/contexts/RoleContext";

interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SignupDialog = ({ isOpen, setIsOpen }: SignupDialogProps) => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn } = useAuth();
  const { setRole } = useRole();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      const result = await signUp(values.email, values.password, {
        role: values.role,
        full_name: values.fullName,
      });

      console.log("Signup successful, user data:", result.user);
      console.log("Selected role:", values.role);

      localStorage.setItem('pendingRole', values.role);
      localStorage.setItem('pendingFullName', values.fullName);

      setIsOpen(false);

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account before logging in. Check your spam folder if you don't see it.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'linkedin') => {
    const formRole = document.querySelector('input[name="role"]:checked') as HTMLInputElement;
    const role = formRole ? formRole.value as UserRole : 'seeker';

    console.log(`Setting pendingRole to ${role} for social login`);
    localStorage.setItem('pendingRole', role);

    console.log(`Attempting social login with ${provider}, role: ${role}`);

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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center">
            Create an account
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Join Homie AI to find your perfect match!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <SignupForm
            onSubmit={handleSignupSubmit}
            isLoading={isLoading}
          />

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <SocialLoginButtons
            onGoogleClick={() => handleSocialLogin('google')}
            onFacebookClick={() => handleSocialLogin('facebook')}
            onLinkedInClick={() => handleSocialLogin('linkedin')}
          />

          <div className="text-xs text-center pt-2">
            Already have an account?{" "}
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="text-roomie-purple hover:underline font-semibold"
            >
              Sign in
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

