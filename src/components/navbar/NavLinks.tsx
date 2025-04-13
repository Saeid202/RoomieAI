
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
  
  const linkClasses = "text-gray-700 hover:text-roomie-purple font-medium";
  const mobileClasses = isMobile ? "py-2" : "";
  
  return (
    <>
      <Link 
        to="/#about" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        About Us
      </Link>
      <a 
        href="#how-it-works" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        How It Works
      </a>
      <a 
        href="#features" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        Features
      </a>
      <a 
        href="#faq" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        FAQ
      </a>
      <Link 
        to="/#contact" 
        className={`${linkClasses} ${mobileClasses}`}
        onClick={handleClick}
      >
        Contact Us
      </Link>
    </>
  );
};
