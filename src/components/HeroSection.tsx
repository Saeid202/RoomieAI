
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cleanup body scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFindMatchClick = () => {
    if (user) {
      navigate("/dashboard");
      return;
    }
    // This will be replaced with signup dialog opening
    const signupButton = document.querySelector('[data-signup-button="true"]') as HTMLButtonElement;
    if (signupButton) signupButton.click();
  };

  const openModal = () => {
    console.log('Opening modal...');
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    console.log('Closing modal...');
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
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
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 shadow-2xl cursor-pointer group"
              onClick={openModal}
            >
              {/* Zoom Icon Overlay */}
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center p-6">
                {/* Try to load the actual flowchart image */}
                <img 
                  src="/roomie-ai-flowchart.png" 
                  alt="Roomie AI Flowchart - Tenant, Landlord, and Renovation Companies Features"
                  className="w-full h-full object-contain rounded-lg shadow-lg transition-opacity duration-300"
                  style={{ maxHeight: '100%', maxWidth: '100%', display: 'none' }} // Hide by default
                  loading="eager"
                  onLoad={() => console.log('Flowchart image loaded successfully')}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.error('Image failed to load, showing detailed flowchart placeholder');
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.parentElement?.querySelector('.flowchart-placeholder');
                    if (fallback) (fallback as HTMLElement).style.display = 'flex';
                  }}
                />
                
                {/* Detailed Flowchart Placeholder - show by default */}
                <div className="flowchart-placeholder flex flex-col items-center justify-center text-center p-4 w-full h-full">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg max-w-full max-h-full overflow-auto">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">Roomie AI Platform</h3>
                    
                    {/* Flowchart Structure */}
                    <div className="space-y-4">
                      {/* Main Box */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center">
                        <div className="font-bold text-lg">Roomie AI</div>
                        <div className="text-sm opacity-90">AI-Powered Platform</div>
                      </div>
                      
                      {/* Three Branches */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Tenant Branch */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Tenant (Seeker)</div>
                          <div className="space-y-1 text-blue-600 dark:text-blue-400">
                            <div>• Profile Creation</div>
                            <div>• Property Search</div>
                            <div>• Roommate Matching</div>
                            <div>• Application Process</div>
                            <div>• Co-buying Options</div>
                          </div>
                        </div>
                        
                        {/* Landlord Branch */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="font-semibold text-green-700 dark:text-green-300 mb-2">Landlord</div>
                          <div className="space-y-1 text-green-600 dark:text-green-400">
                            <div>• Property Listing</div>
                            <div>• Tenant Screening</div>
                            <div>• Document Management</div>
                            <div>• Rent Collection</div>
                            <div>• Maintenance Requests</div>
                          </div>
                        </div>
                        
                        {/* Renovation Branch */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                          <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Renovation</div>
                          <div className="space-y-1 text-purple-600 dark:text-purple-400">
                            <div>• Project Bidding</div>
                            <div>• Cost Estimation</div>
                            <div>• Timeline Planning</div>
                            <div>• Quality Assurance</div>
                            <div>• Payment Processing</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Connections */}
                      <div className="flex justify-center">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            Integrated AI Matching System
                          </div>
                        </div>
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
                  <span className="text-sm font-medium">Click to enlarge</span>
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

      {/* Enlargement Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-6xl max-h-[90vh] w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>

            {/* Enlarged Flowchart Content */}
            <div className="p-8 h-full overflow-auto">
              {/* Try to load the image */}
              <img 
                src="/roomie-ai-flowchart.png" 
                alt="Roomie AI Flowchart - Tenant, Landlord, and Renovation Companies Features"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                loading="eager"
                style={{ display: 'none' }} // Hide by default since file doesn't exist
                onLoad={() => console.log('Modal image loaded successfully')}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.error('Modal image failed to load, showing placeholder');
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.modal-flowchart-placeholder');
                  if (fallback) (fallback as HTMLElement).style.display = 'block';
                }}
              />
              
              {/* Modal Flowchart Placeholder - show by default */}
              <div className="modal-flowchart-placeholder block">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-full mx-auto">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Roomie AI Platform</h3>
                  
                  {/* Flowchart Structure */}
                  <div className="space-y-6">
                    {/* Main Box */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 text-center">
                      <div className="font-bold text-2xl mb-2">Roomie AI</div>
                      <div className="text-lg opacity-90">AI-Powered Platform</div>
                    </div>
                    
                    {/* Three Branches */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Tenant Branch */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
                        <div className="font-bold text-blue-700 dark:text-blue-300 mb-3 text-lg">Tenant (Seeker)</div>
                        <div className="space-y-2 text-blue-600 dark:text-blue-400">
                          <div>• Profile Creation</div>
                          <div>• Property Search</div>
                          <div>• Roommate Matching</div>
                          <div>• Application Process</div>
                          <div>• Co-buying Options</div>
                        </div>
                      </div>
                      
                      {/* Landlord Branch */}
                      <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                        <div className="font-bold text-green-700 dark:text-green-300 mb-3 text-lg">Landlord</div>
                        <div className="space-y-2 text-green-600 dark:text-green-400">
                          <div>• Property Listing</div>
                          <div>• Tenant Screening</div>
                          <div>• Document Management</div>
                          <div>• Rent Collection</div>
                          <div>• Maintenance Requests</div>
                        </div>
                      </div>
                      
                      {/* Renovation Branch */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
                        <div className="font-bold text-purple-700 dark:text-purple-300 mb-3 text-lg">Renovation</div>
                        <div className="space-y-2 text-purple-600 dark:text-purple-400">
                          <div>• Project Bidding</div>
                          <div>• Cost Estimation</div>
                          <div>• Timeline Planning</div>
                          <div>• Quality Assurance</div>
                          <div>• Payment Processing</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connections */}
                    <div className="flex justify-center">
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-6 py-3">
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Integrated AI Matching System
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;

