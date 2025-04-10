
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLogo } from "./navbar/NavLogo";
import { NavLinks } from "./navbar/NavLinks";
import { LoginDialog } from "./navbar/LoginDialog";
import { SignupDialog } from "./navbar/SignupDialog";
import { MobileMenu } from "./navbar/MobileMenu";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <nav className="w-full py-4 bg-white/80 backdrop-blur-sm fixed top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <NavLogo />

        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" onClick={() => setIsLoginOpen(true)}>
            Log in
          </Button>
          <Button onClick={() => setIsSignupOpen(true)}>
            Sign up
          </Button>
          <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
          <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
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
      />
    </nav>
  );
};

export default Navbar;
