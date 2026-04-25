import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";
import { PWAInstallButton } from "../PWAInstallButton";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, LayoutDashboard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransition } from "react";

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
  const [, startTransition] = useTransition();

  if (!isMenuOpen) return null;

  return (
    <>
      {/* Dark overlay - full screen */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      
      {/* Menu panel - slides from right */}
      <div className="fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl border-l border-white/20 overflow-y-auto animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-orange-50">
          <h2 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-roomie-purple to-orange-500 bg-clip-text text-transparent">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close menu"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Menu content */}
        <div className="flex flex-col h-full">
          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6">
            <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Auth Section - sticky at bottom */}
          <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-purple-50 p-4 space-y-3">
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
                    startTransition(() => navigate("/dashboard"));
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  <LayoutDashboard size={16} className="mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 font-medium"
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
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Log in
                </Button>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
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
