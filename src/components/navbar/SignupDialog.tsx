
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
import { supabase } from "@/integrations/supabase/client";

interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SignupDialog = ({ isOpen, setIsOpen }: SignupDialogProps) => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Add role to user metadata
      const metadata = {
        full_name: values.fullName,
        role: values.role,
      };
      
      // Sign up the user with the provided email and password, along with the metadata
      const result = await signUp(values.email, values.password);
      
      if (!result || !result.user) {
        throw new Error("Signup failed");
      }
      
      console.log("Signup successful, user data:", result.user);
      console.log("Selected role:", values.role);
      
      setIsOpen(false);
      
      // We don't navigate yet since the user needs to verify their email first
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account before logging in.",
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
          onGoogleClick={signInWithGoogle}
          onFacebookClick={signInWithFacebook}
          onLinkedInClick={signInWithLinkedIn}
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
