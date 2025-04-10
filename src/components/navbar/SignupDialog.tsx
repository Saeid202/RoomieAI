
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

interface SignupDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SignupDialog = ({ isOpen, setIsOpen }: SignupDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted");
    setIsOpen(false);
    toast({
      title: "Account created",
      description: "You've successfully created an account!",
    });
    navigate("/dashboard");
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
            <Input id="name" placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Create a password" />
          </div>
          <Button type="submit" className="w-full bg-roomie-purple hover:bg-roomie-dark text-white">
            Create Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
