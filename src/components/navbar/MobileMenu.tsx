
import { Button } from "@/components/ui/button";
import { NavLinks } from "./NavLinks";
import { LoginDialog } from "./LoginDialog";
import { SignupDialog } from "./SignupDialog";

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isLoginOpen: boolean;
  setIsLoginOpen: (isOpen: boolean) => void;
  isSignupOpen: boolean;
  setIsSignupOpen: (isOpen: boolean) => void;
}

export const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  isLoginOpen,
  setIsLoginOpen,
  isSignupOpen,
  setIsSignupOpen,
}: MobileMenuProps) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white w-full py-4 px-6 shadow-md">
      <div className="flex flex-col space-y-4">
        <NavLinks isMobile={true} onClickMobile={() => setIsMenuOpen(false)} />
        <div className="flex flex-col space-y-2 pt-2">
          <Button variant="outline" className="w-full" onClick={() => setIsLoginOpen(true)}>
            Log in
          </Button>
          <Button className="w-full" onClick={() => setIsSignupOpen(true)}>
            Sign up
          </Button>
          <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
          <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
        </div>
      </div>
    </div>
  );
};
