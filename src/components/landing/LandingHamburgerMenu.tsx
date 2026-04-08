import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
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
      {/* Hamburger Button - Top Right, above Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 right-4 z-[60] md:hidden p-2 rounded-lg bg-white/90 shadow-md border border-gray-200 hover:bg-purple-50 transition-colors cursor-pointer"
        aria-label="Toggle menu"
        type="button"
        style={{ touchAction: 'manipulation' }}
      >
        {isOpen ? (
          <X size={28} className="text-purple-600" strokeWidth={2.5} />
        ) : (
          <Menu size={28} className="text-purple-600" strokeWidth={2.5} />
        )}
      </button>

      {/* Full-Page Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Homie AI
            </span>
            <button
              onClick={closeMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Navigation Items */}
            <nav className="space-y-2 mb-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.href)}
                  className="block w-full text-left text-lg font-semibold text-gray-900 hover:text-purple-600 hover:bg-purple-50 transition-colors py-3 px-3 rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="h-px bg-gradient-to-r from-purple-600 to-orange-400 my-6" />

            {/* User Info (if logged in) */}
            {user && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
                <p className="font-semibold text-gray-900 text-sm mt-1">{user.email?.split("@")[0]}</p>
              </div>
            )}
          </div>

          {/* Fixed Auth Buttons at Bottom */}
          <div className="border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {user ? (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  closeMenu();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsLoginOpen(true);
                    closeMenu();
                  }}
                  className="w-full px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setIsSignupOpen(true);
                    closeMenu();
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 text-white rounded-lg font-bold text-sm"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <LoginDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
      <SignupDialog isOpen={isSignupOpen} setIsOpen={setIsSignupOpen} />
    </>
  );
};

export default LandingHamburgerMenu;
