
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full py-4 bg-white/80 backdrop-blur-sm fixed top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-roomie-purple"
          >
            <path
              d="M2 22H22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.95 22L3 9.97C3 9.36 3.29 8.78 3.77 8.4L10.77 2.95C11.49 2.39 12.5 2.39 13.23 2.95L20.23 8.39C20.72 8.77 21 9.34 21 9.97V22"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 11H8.5C7.67 11 7 11.67 7 12.5V22H17V12.5C17 11.67 16.33 11 15.5 11Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 16.25V17.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5 7.5H13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-roomie-purple to-roomie-accent">
            RoomieMatch
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-gray-700 hover:text-roomie-purple font-medium">
            How It Works
          </a>
          <a href="#features" className="text-gray-700 hover:text-roomie-purple font-medium">
            Features
          </a>
          <a href="#testimonials" className="text-gray-700 hover:text-roomie-purple font-medium">
            Testimonials
          </a>
          <a href="#faq" className="text-gray-700 hover:text-roomie-purple font-medium">
            FAQ
          </a>
        </div>

        {/* Login / Sign Up Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-roomie-purple text-roomie-purple">
            Login
          </Button>
          <Button className="bg-roomie-purple hover:bg-roomie-dark text-white">
            Sign Up
          </Button>
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
        <div className="md:hidden bg-white w-full py-4 px-6 shadow-md">
          <div className="flex flex-col space-y-4">
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-roomie-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-roomie-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-roomie-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-gray-700 hover:text-roomie-purple font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" className="border-roomie-purple text-roomie-purple">
                Login
              </Button>
              <Button className="bg-roomie-purple hover:bg-roomie-dark text-white">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
