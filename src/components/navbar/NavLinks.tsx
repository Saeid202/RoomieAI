import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";

interface NavLinksProps {
  isMobile?: boolean;
  onClickMobile?: () => void;
}

export const NavLinks = ({ isMobile = false, onClickMobile }: NavLinksProps) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const handleClick = () => {
    if (isMobile && onClickMobile) {
      onClickMobile();
    }
  };
  
  const isActive = (path: string) => {
    if (path.startsWith("/#")) {
      return location.pathname === "/" && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };
  
  const linkClasses = "text-white/90 hover:text-white font-light text-lg lg:text-xl xl:text-2xl flex items-center gap-2 transition-all duration-300 ease-out relative group tracking-wide";
  const mobileClasses = isMobile ? "py-3 text-xl" : "px-3 lg:px-4 xl:px-6 py-2 lg:py-3";
  const separatorClasses = isMobile ? "hidden" : "text-white/30 mx-3 lg:mx-4 xl:mx-6 text-xl lg:text-xl xl:text-2xl font-light";
  const activeClasses = "text-white font-semibold bg-white/10 rounded-lg px-2 py-1";
  
  const navItems = [
    { path: "/about-us", label: "About Us", emoji: "🏢" },
    { path: "/#how-it-works", label: "How It Works", emoji: "⚙️" },
    { path: "/#features", label: "Features", emoji: "✨" },
    { path: "/faq", label: "FAQ", emoji: "❓" },
    { path: "/contact-us", label: "Contact Us", emoji: "📞" }
  ];
  
  return (
    <>
      {navItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <Link 
            to={item.path} 
            className={`${linkClasses} ${mobileClasses} ${isActive(item.path) ? activeClasses : ''} ${hoveredItem === item.path ? 'scale-105' : ''}`}
            onClick={handleClick}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span className={`transition-transform duration-300 text-lg lg:text-xl xl:text-2xl ${hoveredItem === item.path ? 'scale-125 rotate-12' : ''}`}>
              {item.emoji}
            </span>
            <span className="relative">
              {item.label}
              {/* Underline animation */}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 transition-all duration-500 ease-out shadow-lg shadow-amber-400/50 ${
                hoveredItem === item.path || isActive(item.path) ? 'w-full' : 'w-0'
              }`} />
            </span>
            {/* Active state indicator */}
            {isActive(item.path) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
            )}
          </Link>
          {index < navItems.length - 1 && <span className={separatorClasses}>|</span>}
        </div>
      ))}
    </>
  );
};
