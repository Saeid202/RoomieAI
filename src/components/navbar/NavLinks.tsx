
import { Link } from "react-router-dom";

interface NavLinksProps {
  isMobile?: boolean;
  onClickMobile?: () => void;
}

export const NavLinks = ({ isMobile = false, onClickMobile }: NavLinksProps) => {
  const handleClick = () => {
    if (isMobile && onClickMobile) {
      onClickMobile();
    }
  };
  
  const linkClasses = "text-gray-800 hover:text-roomie-purple font-semibold text-base";
  const mobileClasses = isMobile ? "py-3 text-lg" : "";
  
  return (
    <>
      <Link 
        to="/about-us" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        About Us
      </Link>
      <a 
        href="/#how-it-works" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        How It Works
      </a>
      <a 
        href="/#features" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        Features
      </a>
      <Link 
        to="/faq" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        FAQ
      </Link>
      <Link 
        to="/contact-us" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        Contact Us
      </Link>
    </>
  );
};
