
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { PublicPropertyListings } from "@/components/public/PublicPropertyListings";
import { useLocation } from "react-router-dom";
import { set } from "date-fns";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    document.title = "Roomie AI - Find Your Ideal Roommate";
    console.log("Home page rendered");
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
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        
        {/* Public Property Listings */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Available Properties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse our latest rental and sales listings. No account required to view - sign up when you're ready to apply!
              </p>
            </div>
            <PublicPropertyListings limit={6} showFilters={true} showSearch={true} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
