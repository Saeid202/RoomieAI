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
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Slide-in menu panel */}
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 pointer-events-none">
        <div className="flex flex-col h-full w-full max-w-sm ml-auto pointer-events-auto bg-[#0f172a] shadow-2xl animate-slide-in-right">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="logo flex items-center gap-3">
                <div className="logo-icon">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <span className="logo-text font-bold text-xl">
                  Homie<span className="font-extrabold">Pro</span>
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-[#d97706] transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 flex flex-col space-y-6">
              <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-4">
                    <UserIcon size={20} className="text-[#d97706]" />
                    <span className="font-medium text-white truncate flex-1">
                      {user.email ? user.email.split('@')[0] : 'Account'}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-[#d97706] hover:bg-[#b45309] text-white mb-3"
                  >
                    <LayoutDashboard size={18} className="mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full mb-3 bg-white/5 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Log in
                  </Button>
                  <Button
                    className="w-full bg-[#d97706] hover:bg-[#b45309] text-white"
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
      </div>
    </>
  );
};
