
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Facebook, Linkedin } from "lucide-react";

// Updated interface to match the props being passed in Navbar.tsx and MobileMenu.tsx
export interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function SignupDialog({ isOpen, setIsOpen }: SignupDialogProps) {
  const { signUp, signInWithGoogle, signInWithFacebook, signInWithLinkedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password);
      
      // The profile will be created with the trigger we set up
      // But we can add the full name to the user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
        }
      });
      
      form.reset();
      setIsOpen(false);
      navigate("/dashboard");
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-11 bg-roomie-purple hover:bg-roomie-dark text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

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
            className="flex items-center justify-center h-11"
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
            className="flex items-center justify-center h-11"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={signInWithLinkedIn}
            className="flex items-center justify-center h-11"
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
