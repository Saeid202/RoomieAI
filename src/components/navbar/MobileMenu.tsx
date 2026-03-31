import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, LayoutDashboard, X } from "lucide-react";
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
    <>
      {/* Backdrop overlay - starts below navbar */}
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Slide-in menu panel - starts below navbar */}
      <div className="fixed top-16 right-0 bottom-0 z-50 w-full max-w-xs pointer-events-auto bg-white shadow-2xl animate-slide-in-right">
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col space-y-4">
            <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
          </div>

          {/* Auth Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <UserIcon size={18} className="text-primary" />
                  <span className="font-medium text-gray-900 truncate flex-1">
                    {user.email ? user.email.split('@')[0] : 'Account'}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  <LayoutDashboard size={16} className="mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Log in
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white"
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
    </>
  );
};
