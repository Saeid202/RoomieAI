import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { checkIsAdmin } from "@/services/adminService";

export default function AdminLoginPage() {
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Sign in the user
      const authData = await signIn(email, password);
      
      if (!authData?.user) throw new Error("No user data returned");

      // Check if user has admin role in database
      const isAdmin = await checkIsAdmin(authData.user.id);

      if (!isAdmin) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        
        toast({
          title: "Access Denied",
          description: "You do not have administrator privileges. This attempt has been logged.",
          variant: "destructive",
        });
        
        setLoading(false);
        return;
      }

      // User is verified admin, update metadata and redirect
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });

      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard",
      });
      
      navigate('/dashboard/admin');
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, check admin status and redirect
  if (user) {
    checkIsAdmin(user.id).then(isAdmin => {
      if (isAdmin) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Administrator Login</CardTitle>
          <CardDescription className="text-center">
            This area is restricted to authorized administrators only
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleAdminLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Administrator Email</Label>
              <Input 
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input 
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                <strong>Security Notice:</strong> All login attempts are logged and monitored. 
                Unauthorized access attempts will be reported.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? "Verifying..." : "Login as Administrator"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Not an administrator?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Regular Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
