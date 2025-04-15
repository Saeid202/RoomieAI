
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // If already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard/roommate-recommendations');
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Account created",
          description: "Please check your email to verify your account",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Logged in successfully",
          description: "Welcome back!",
        });
        navigate('/dashboard/roommate-recommendations');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create an Account" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create an account to find your ideal roommate" 
              : "Sign in to access your roommate profile"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="your@email.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <div className="text-center text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                className="ml-1 text-blue-600 hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
