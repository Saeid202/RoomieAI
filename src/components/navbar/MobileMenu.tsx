
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (isOpen: boolean) => void;
  isSignupOpen: boolean;
  setIsSignupOpen: (isOpen: boolean) => void;
  user: User | null;
  handleSignOut: () => Promise<void>;
}

export const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  isLoginOpen,
  setIsLoginOpen,
  isSignupOpen,
  setIsSignupOpen,
  user,
  handleSignOut,
}: MobileMenuProps) => {
  const navigate = useNavigate();
  
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white w-full py-4 px-6 shadow-md">
      <div className="flex flex-col space-y-4">
        <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
        <div className="flex flex-col space-y-2 pt-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <UserIcon size={16} />
                <span className="font-medium text-sm">
                  {user.email ? user.email.split('@')[0] : 'Account'}
                </span>
              </div>
              <Button 
                onClick={() => {
                  navigate("/dashboard");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-roomie-purple hover:bg-roomie-dark text-white"
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 text-red-500 border-red-200"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={() => setIsLoginOpen(true)}>
                Log in
              </Button>
              <Button 
                className="w-full bg-roomie-purple hover:bg-roomie-dark text-white" 
                onClick={() => setIsSignupOpen(true)}
              >
                Sign up
              </Button>
              <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
              <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
