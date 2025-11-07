import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("bg-gray-900 text-white pt-16 pb-8", className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
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
              <h1 className="text-xl font-bold text-roomie-purple">
                RoomieMatch
              </h1>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              RoomieMatch helps you find the ideal roommate based on your lifestyle, budget, and location preferences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about-us" className="text-gray-400 hover:text-roomie-purple transition-colors">About Us</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Help Center</a></li>
              <li><Link to="/safety-center" className="text-gray-400 hover:text-roomie-purple transition-colors">Safety Center</Link></li>
              <li><Link to="/community-guidelines" className="text-gray-400 hover:text-roomie-purple transition-colors">Community Guidelines</Link></li>
              <li><Link to="/contact-us" className="text-gray-400 hover:text-roomie-purple transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Terms of Service</a></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-roomie-purple transition-colors">Privacy Policy</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-roomie-purple transition-colors">Trust & Safety</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} RoomieMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
