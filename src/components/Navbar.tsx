import { useState, useEffect, useTransition } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { LoginDialog } from "./navbar/LoginDialog";
import { SignupDialog } from "./navbar/SignupDialog";
import { MobileMenu } from "./navbar/MobileMenu";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "./notifications/NotificationBell";
import { PWAInstallButton } from "./PWAInstallButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  hideMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

const Navbar = ({ hideMobileMenu = false, onMobileMenuToggle }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, startTransition] = useTransition();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const goTo = (path: string) => {
    startTransition(() => navigate(path));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="w-full py-4 bg-white/90 backdrop-blur-sm fixed top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center relative">
        
        {/* Left side: hamburger (landing page only) + logo */}
        <div className="flex items-center gap-3">
          {hideMobileMenu && (
            <button
              id="landing-hamburger"
              onClick={onMobileMenuToggle}
              className="md:hidden text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Open menu"
              type="button"
              style={{ touchAction: 'manipulation' }}
            >
              <Menu size={26} />
            </button>
          )}
          <NavLogo />
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <PWAInstallButton />
          {user ? (
            <div className="flex items-center space-x-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 font-semibold max-w-[220px]">
                    <User size={16} className="flex-shrink-0" />
                    <span className="truncate">{user.email || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => goTo("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
                Log in
              </Button>
              <Button 
                onClick={() => setIsSignupOpen(true)}
                className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white font-bold hover:shadow-xl transition-all"
                data-signup-button="true"
              >
                Sign up
              </Button>
              <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
              <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          {/* Non-landing pages: hamburger on right */}
          {!hideMobileMenu && (
            <button
              className="text-gray-700 hover:text-gray-900 p-2.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              type="button"
              style={{ touchAction: 'manipulation' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          {/* Landing page: user dropdown when logged in */}
          {hideMobileMenu && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm active:scale-95 transition-all max-w-[180px]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 truncate">
                    {user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 z-[70]">
                <DropdownMenuItem onClick={() => goTo("/dashboard")} className="font-semibold">
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut size={14} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        isSignupOpen={isSignupOpen}
        setIsSignupOpen={setIsSignupOpen}
        user={user}
        handleSignOut={handleSignOut}
      />
    </nav>
  );
};

export default Navbar;
