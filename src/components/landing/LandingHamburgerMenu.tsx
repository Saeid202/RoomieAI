import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/navbar/LoginDialog";
import { SignupDialog } from "@/components/navbar/SignupDialog";

const LandingHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { id: "about", label: "About Us", href: "/#about" },
    { id: "how-it-works", label: "How It Works", href: "/#how-it-works" },
    { id: "features", label: "Features", href: "/#features" },
    { id: "faq", label: "FAQ", href: "/#faq" },
    { id: "contact", label: "Contact Us", href: "/#contact" },
  ];

  const handleMenuClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button - Top Right Corner */}
      <button
        onClick={() => {
          console.log('Landing menu button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="fixed top-4 right-4 z-50 md:hidden p-3 rounded-lg bg-white shadow-lg border-2 border-roomie-purple hover:bg-purple-50 transition-colors cursor-pointer active:scale-95"
        aria-label="Toggle menu"
        type="button"
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
      >
        {isOpen ? (
          <X size={32} className="text-roomie-purple" strokeWidth={2.5} />
        ) : (
          <Menu size={32} className="text-roomie-purple" strokeWidth={2.5} />
        )}
      </button>

      {/* Full-Page Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden flex flex-col">
          {/* Close button area */}
          <div className="h-16 flex items-center justify-end px-4 border-b border-gray-100">
            <button
              onClick={closeMenu}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Navigation Items */}
            <nav className="space-y-4 mb-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.href)}
                  className="block w-full text-left text-lg font-semibold text-gray-900 hover:text-roomie-purple transition-colors py-2"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-roomie-purple to-orange-400 my-6" />

            {/* User Info (if logged in) */}
            {user && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
                <p className="font-semibold text-gray-900 text-sm mt-1">{user.email?.split("@")[0]}</p>
              </div>
            )}
          </div>

          {/* Fixed Auth Buttons at Bottom */}
          <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <button
              onClick={() => {
                setIsLoginOpen(true);
                closeMenu();
              }}
              className="w-full px-4 py-2.5 border-2 border-roomie-purple text-roomie-purple rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setIsSignupOpen(true);
                closeMenu();
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:shadow-xl hover:from-purple-700 hover:via-purple-600 hover:to-orange-600 text-white rounded-lg transition-all font-bold text-sm tracking-wide"
            >
              Sign up
            </button>
          </div>
        </div>
      )}

      {/* Auth Dialogs */}
      <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
      <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
    </>
  );
};

export default LandingHamburgerMenu;
