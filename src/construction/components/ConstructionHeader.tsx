import { useState, useEffect } from "react";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client-simple";
import AuthModal from "./AuthModal";

const ConstructionHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="w-full py-4 bg-white fixed top-0 left-0 z-[9999] shadow-sm" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/construction" className="flex items-center space-x-2">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-orange-500"
          >
            {/* Hard hat / helmet shape */}
            <path
              d="M18 3C10.82 3 5 7.58 5 13V16H31V13C31 7.58 25.18 3 18 3Z"
              fill="currentColor"
            />
            {/* Helmet brim */}
            <path
              d="M3 16H33C34.1 16 35 16.9 35 18V19C35 19.55 34.55 20 34 20H2C1.45 20 1 19.55 1 19V18C1 16.9 1.9 16 3 16Z"
              fill="currentColor"
            />
            {/* Hammer handle */}
            <rect x="24" y="22" width="4" height="12" rx="1" fill="#F59E0B" />
            {/* Hammer head */}
            <rect x="20" y="20" width="12" height="5" rx="1" fill="#1F2937" />
            {/* Wrench */}
            <rect x="8" y="23" width="4" height="10" rx="1" fill="#6B7280" transform="rotate(-30 10 28)" />
            <circle cx="6" cy="26" r="3" fill="#6B7280" transform="rotate(-30 6 26)" />
          </svg>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600">
            Homie Construction
          </h1>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-gray-800 hover:text-roomie-purple font-semibold text-base">
            About Us
          </a>
          <a href="#services" className="text-gray-800 hover:text-roomie-purple font-semibold text-base">
            Our Services
          </a>
          <a href="#products" className="text-gray-800 hover:text-roomie-purple font-semibold text-base">
            Products
          </a>
          <a href="#contact" className="text-gray-800 hover:text-roomie-purple font-semibold text-base">
            Contact Us
          </a>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 font-semibold">
                    <User size={16} />
                    {user.email ? user.email.split('@')[0] : 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={async () => {
                    const { data: supplierProfile } = await supabase
                      .from('construction_supplier_profiles')
                      .select('id').eq('id', user.id).maybeSingle()
                    navigate(supplierProfile ? "/construction/dashboard" : "/construction")
                  }}>
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
              <Button variant="outline" onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}>
                Log in
              </Button>
              <Button 
                className="bg-roomie-purple hover:bg-roomie-dark text-white"
                onClick={() => { setAuthModalTab('signup'); setAuthModalOpen(true); }}
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white w-full py-4 px-6 shadow-md">
          <div className="flex flex-col space-y-4">
            <a href="#about" className="text-gray-800 hover:text-roomie-purple font-semibold text-base py-3">
              About Us
            </a>
            <a href="#services" className="text-gray-800 hover:text-roomie-purple font-semibold text-base py-3">
              Our Services
            </a>
            <a href="#products" className="text-gray-800 hover:text-roomie-purple font-semibold text-base py-3">
              Products
            </a>
            <a href="#contact" className="text-gray-800 hover:text-roomie-purple font-semibold text-base py-3">
              Contact Us
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <User size={16} />
                    <span className="font-medium text-sm truncate">
                      {user.email ? user.email.split('@')[0] : 'Account'}
                    </span>
                  </div>
                  <Button 
                    onClick={async () => {
                      const { data: supplierProfile } = await supabase
                        .from('construction_supplier_profiles')
                        .select('id').eq('id', user.id).maybeSingle()
                      navigate(supplierProfile ? "/construction/dashboard" : "/construction")
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-roomie-purple hover:bg-roomie-dark text-white"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-500 border-red-200"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); setIsMenuOpen(false); }}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="w-full bg-roomie-purple hover:bg-roomie-dark text-white"
                    onClick={() => { setAuthModalTab('signup'); setAuthModalOpen(true); setIsMenuOpen(false); }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultTab={authModalTab}
      />
    </nav>
  );
};

export default ConstructionHeader;
