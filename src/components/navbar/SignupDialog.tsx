
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { SignupForm, SignupFormValues } from "@/components/auth/SignupForm";
import { useRole } from "@/contexts/RoleContext";
import { UserRole } from "@/contexts/RoleContext";

// Updated interface to match the props being passed in Navbar.tsx and MobileMenu.tsx
export interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function SignupDialog({ isOpen, setIsOpen }: SignupDialogProps) {
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useRole();

  const handleSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password);
      
      // The profile will be created with the trigger we set up
      // But we can add the full name and role to the user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
          role: values.role,
        }
      });
      
      // Set the selected role in the app context
      setRole(values.role as UserRole);
      
      setIsOpen(false);
      
      // Redirect based on role
      if (values.role === 'landlord') {
        navigate("/dashboard/landlord");
      } else if (values.role === 'developer') {
        navigate("/dashboard/developer");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Create an account</DialogTitle>
          <DialogDescription className="text-center">
            Sign up for Roomie to find your perfect roommate match!
          </DialogDescription>
        </DialogHeader>

        <SignupForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        <div className="relative mt-2 mb-4">
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
      </DialogContent>
    </Dialog>
  );
}
