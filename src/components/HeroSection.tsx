
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleFindMatchClick = () => {
    navigate("/"); // This will be replaced with signup dialog opening
    const signupButton = document.querySelector('[data-signup-button="true"]') as HTMLButtonElement;
    if (signupButton) signupButton.click();
  };

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-20 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Find Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-roomie-purple to-roomie-accent">
                Perfect Roommate or Co-investor Match
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              Our AI-powered platform connects you with compatible roommates or co-investor to buy a house based on your lifestyle, budget, and location preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-roomie-purple hover:bg-roomie-dark text-white text-lg px-8 py-6"
                onClick={handleFindMatchClick}
              >
                Find My Match
              </Button>
              <Button 
                variant="outline" 
                className="border-roomie-purple text-roomie-purple text-lg px-8 py-6"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </Button>
            </div>
            <div className="mt-8 flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-gray-200 to-gray-300"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-bold">5,000+</span> successful roommate matches!
              </p>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative w-full h-96 bg-white rounded-xl shadow-xl overflow-hidden card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-roomie-purple/10 to-roomie-accent/5"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mb-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-roomie-light flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-800">Alex, 28</h3>
                      <p className="text-sm text-gray-500">Professional, Clean, Early bird</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium text-gray-800">$800-1200/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium text-gray-800">Downtown Seattle</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Move-in</span>
                      <span className="font-medium text-gray-800">Aug 15 - Sep 1</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative ml-8">
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-roomie-purple text-white p-1 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-roomie-light flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-800">Jamie, 25</h3>
                      <p className="text-sm text-gray-500">Student, Pet-friendly, Night owl</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium text-gray-800">$750-1100/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium text-gray-800">Capitol Hill</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Move-in</span>
                      <span className="font-medium text-gray-800">Sep 1 - Sep 15</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <span className="text-roomie-purple font-medium">92% Match</span>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-roomie-purple to-roomie-accent rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-roomie-light rounded-full flex items-center justify-center animate-float shadow-md hidden md:flex">
              <span className="font-bold text-roomie-purple">AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
