
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      // Store metadata in localStorage before signup
      const metadata = {
        full_name: values.fullName,
        role: values.role,
      };
      
      // Store role directly for immediate access
      localStorage.setItem('userRole', values.role);
      console.log("Stored user role in localStorage:", values.role);
      
      // For social auth without prior signup
      localStorage.setItem('pendingRole', values.role);
      console.log("Stored pending role in localStorage:", values.role);
      
      // Set role in context for consistent UI
      setRole(values.role);
      
      // Store signup data for use in callback
      localStorage.setItem('signupData', JSON.stringify(metadata));
      
      // Sign up the user with the provided email and password
      const result = await signUp(values.email, values.password);
      
      console.log("Signup successful, user data:", result.user);
      console.log("Selected role:", values.role);
      
      setIsOpen(false);
      
      // We should see a message about email verification
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
    // Make sure to get the current role selection from the form
    const formRole = document.querySelector('input[name="role"]:checked') as HTMLInputElement;
    const role = formRole ? formRole.value as UserRole : 'seeker';
    
    // Store the role for OAuth flow
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Create an account
          </DialogTitle>
          <DialogDescription className="text-center">
            Join RoomieMatch to find your perfect roommate or property match!
          </DialogDescription>
        </DialogHeader>
        
        <SignupForm 
          onSubmit={handleSignupSubmit}
          isLoading={isLoading}
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
        
        <DialogFooter className="flex justify-center mt-4">
          <div className="text-sm text-center">
            Already have an account?{" "}
            <button 
              onClick={() => {
                setIsOpen(false);
                // You'd typically open the login dialog here
              }}
              className="text-roomie-purple hover:underline"
            >
              Sign in
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
