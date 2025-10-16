
import { useState } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { LoginDialog } from "./navbar/LoginDialog";
import { SignupDialog } from "./navbar/SignupDialog";
import { MobileMenu } from "./navbar/MobileMenu";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ContractNotifications } from "./notifications/ContractNotifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="w-full py-4 bg-white/90 backdrop-blur-sm fixed top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <NavLogo />

        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <ContractNotifications />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 font-semibold">
                    <User size={16} />
                    {user.email ? user.email.split('@')[0] : 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
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
                className="bg-roomie-purple hover:bg-roomie-dark text-white"
                data-signup-button="true"
              >
                Sign up
              </Button>
              <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
              <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
            </>
          )}
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
