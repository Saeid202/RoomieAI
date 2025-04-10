
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Facebook, Linkedin } from "lucide-react";

interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SignupDialog = ({ isOpen, setIsOpen }: SignupDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First sign up the user
      await signUp(email, password);
      
      // Store the full name in the profiles table
      // This will be handled after email verification
      
      // Close the dialog and show success message
      setIsOpen(false);
      toast({
        title: "Account created",
        description: "Please check your email to verify your account",
      });
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-roomie-purple hover:bg-roomie-dark text-white">
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create an account</DialogTitle>
          <DialogDescription>
            Join RoomieMatch to find your perfect roommate match.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignupSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your full name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-roomie-purple hover:bg-roomie-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
          
          <div className="relative mt-2 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={signInWithGoogle}
              className="flex items-center justify-center"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54L20.0303 3.115C17.9553 1.185 15.2353 0 12.0003 0C7.31533 0 3.25533 2.695 1.28033 6.63L5.27033 9.74C6.21533 6.86 8.87033 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2599C5.02498 13.5699 4.88498 12.8349 4.88498 12.0699C4.88498 11.2949 5.01998 10.5599 5.26998 9.85992L1.27998 6.74992C0.45998 8.34992 -1.90735e-05 10.1699 -1.90735e-05 12.0699C-1.90735e-05 13.9699 0.45998 15.7999 1.28498 17.3999L5.26498 14.2599Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.255L1.27539 17.365C3.25539 21.3 7.31539 24.0001 12.0004 24.0001Z"
                  fill="#34A853"
                />
              </svg>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={signInWithFacebook}
              className="flex items-center justify-center"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={signInWithLinkedIn}
              className="flex items-center justify-center"
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
