import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { PWAInstallButton } from "../PWAInstallButton";
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
      {/* Dark overlay - full screen */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Menu panel - slides from left, 75% width */}
      <div className="fixed inset-y-0 left-0 z-50 w-3/4 bg-white shadow-2xl animate-slide-in-left overflow-y-auto">
        {/* Close button */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors p-2 -mr-2"
          >
            <X size={28} />
          </button>
        </div>

        {/* Menu content */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6">
            <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
          </div>

          {/* Auth Section - sticky at bottom */}
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            <PWAInstallButton />
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-2">
                  <UserIcon size={18} className="text-primary flex-shrink-0" />
                  <span className="font-medium text-gray-900 truncate">
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
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
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
