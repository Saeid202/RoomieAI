
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
    <section className="hero-section">
      {/* Floating Background Elements */}
      <div className="floating-element w-64 h-64 top-1/4 left-1/4 opacity-30"></div>
      <div className="floating-element w-96 h-96 bottom-1/4 right-1/4 opacity-20"></div>
      <div className="floating-element w-32 h-32 top-1/2 right-1/3 opacity-40"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          <div className="space-y-8 text-center lg:text-left">
            <div className="animate-fade-in">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                ✨ AI-Powered Technology
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-slide-up">
              <span className="block">Find Your</span>
              <span className="block text-gradient">Perfect Roommate Match</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary/80 font-medium animate-slide-up" style={{animationDelay: '0.2s'}}>
              AI-Powered Compatibility Matching
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-slide-up" style={{animationDelay: '0.4s'}}>
              Our AI-powered platform connects you with compatible roommates or co-investors to buy a house based on your lifestyle, budget, and location preferences.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">5,000+</div>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">95%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                <p className="text-sm text-muted-foreground">Avg. Match</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">AI</div>
                <p className="text-sm text-muted-foreground">Powered</p>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{animationDelay: '0.8s'}}>
              <button 
                className="btn-primary text-lg h-14 px-8 shadow-glow hover:shadow-glow-lg transition-all duration-300 group"
                onClick={handleFindMatchClick}
              >
                Find My Match
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button 
                className="btn-secondary text-lg h-14 px-8"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </button>
            </div>
          </div>
          {/* Media */}
          <div className="relative animate-fade-in-scale" style={{animationDelay: '0.5s'}}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm border border-primary/20 shadow-2xl">
              <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg w-full max-w-md mb-4">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-foreground">Alex, 28</h3>
                      <p className="text-sm text-muted-foreground">Professional, Clean, Early bird</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium text-foreground">$800-1200/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-foreground">Downtown Seattle</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Move-in</span>
                      <span className="font-medium text-foreground">Aug 15 - Sep 1</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg w-full max-w-md relative ml-8">
                  <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-1 rounded-full">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-foreground">Jamie, 25</h3>
                      <p className="text-sm text-muted-foreground">Student, Pet-friendly, Night owl</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium text-foreground">$750-1100/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-foreground">Capitol Hill</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Move-in</span>
                      <span className="font-medium text-foreground">Sep 1 - Sep 15</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <span className="text-primary font-medium">92% Match</span>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                <span className="text-yellow-500">⭐</span>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Demo</span>
                </div>
              </div>
            </div>
            
            {/* AI Badge */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-float shadow-glow hidden md:flex">
              <span className="font-bold text-primary">AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

