
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LandingHamburgerMenu from "@/components/landing/LandingHamburgerMenu";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { PublicPropertyListings } from "@/components/public/PublicPropertyListings";
import { useLocation } from "react-router-dom";
import { Home } from "lucide-react";

export default function HomePage() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Homie AI - Find Your Ideal Roommate";
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar hideMobileMenu={true} onMobileMenuToggle={() => setMenuOpen(o => !o)} />
      <LandingHamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">
        <HeroSection />
        <div className="mx-6 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
        <FeaturesSection />
        <div className="mx-6 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
        <HowItWorks />
        <div className="mx-6 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
        
        {/* Public Property Listings */}
        <section id="properties" className="py-16 bg-gradient-to-br from-slate-50 via-orange-50/20 to-purple-50/20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* Section Header */}
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl orange-purple-gradient shadow-lg">
                  <Home className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gradient tracking-tight">
                    Available Properties
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Browse our latest rental and sales listings
                  </p>
                </div>
              </div>
            </header>
            <PublicPropertyListings limit={6} showFilters={true} showSearch={true} />
          </div>
        </section>
      </main>
      <div className="mx-6 md:mx-16 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60" />
      <Footer />
    </div>
  );
}
