import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ConstructionHeaderNew() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full py-4 bg-white/90 backdrop-blur-sm fixed top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/construction" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <h1 className="text-2xl font-bold text-purple-900">
            Homie<span className="text-purple-600">Pro</span>
          </h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-gray-800 hover:text-purple-600 font-semibold text-base transition">
            About Us
          </a>
          <a href="#services" className="text-gray-800 hover:text-purple-600 font-semibold text-base transition">
            Our Services
          </a>
          <a href="#products" className="text-gray-800 hover:text-purple-600 font-semibold text-base transition">
            Products
          </a>
          <a href="#contact" className="text-gray-800 hover:text-purple-600 font-semibold text-base transition">
            Contact Us
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-6 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition">
            Log in
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition">
            Get a Quote
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
          <div className="flex flex-col space-y-4">
            <a href="#about" className="text-gray-800 hover:text-purple-600 font-semibold py-2">
              About Us
            </a>
            <a href="#services" className="text-gray-800 hover:text-purple-600 font-semibold py-2">
              Our Services
            </a>
            <a href="#products" className="text-gray-800 hover:text-purple-600 font-semibold py-2">
              Products
            </a>
            <a href="#contact" className="text-gray-800 hover:text-purple-600 font-semibold py-2">
              Contact Us
            </a>
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">
                Log in
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
                Get a Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
