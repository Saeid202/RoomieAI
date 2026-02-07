import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { ProfileLoadingHandler } from "./recommendations/ProfileLoadingHandler";
import { MasterBox } from "./MasterBox";
import { SubFeatureButton } from "./SubFeatureButton";
import { Users, Home, FileText, CreditCard, TrendingUp, Hammer, BookOpen, Bot, Heart, Search, Calendar, DollarSign, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoommateRecommendationsProps {
  onError?: (error: Error) => void;
}

export function RoommateRecommendations({
  onError,
}: RoommateRecommendationsProps) {
  const { toast } = useToast();
  const { loadProfileData, initialized } = useRoommateMatching();
  const navigate = useNavigate();

  const handleError = useCallback(
    (error: Error) => {
      console.error("Error in RoommateRecommendations:", error);

      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });

      if (onError) {
        onError(error);
      }
    },
    [toast, onError]
  );

  if (!initialized) {
    return (
      <ProfileLoadingHandler
        loadProfileData={loadProfileData}
        onError={handleError}
      >
        <div>Loading your profile data...</div>
      </ProfileLoadingHandler>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 space-y-10 pb-10">
      {/* Dashboard Orientation & Roadmap Section */}
      <div className="relative bg-card rounded-2xl p-4 border shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-transparent opacity-30 rotate-45"></div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-4 relative z-10">
          <div className="inline-block">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Roomie AI
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-2"></div>
            <p className="text-lg text-foreground max-w-xl mx-auto font-medium leading-relaxed">
              Your all-in-one platform for renting, matching, paying, and building your future.
            </p>
          </div>
        </div>

        {/* Short Explanation */}
        <div className="text-center mb-4 relative z-10">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-3 border shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-foreground text-base leading-relaxed relative z-10">
              Roomie AI brings every step of the rental journey into one secure platform — from finding the right roommate or home, to applying, paying rent, and accessing legal, financial, and educational support. The sections below guide you through each stage.
            </p>
          </div>
        </div>

        {/* Visual Roadmap */}
        <div className="grid grid-cols-4 gap-3 mb-4 relative z-10">
          <div className="text-center space-y-2 group">
            <div className="bg-card rounded-2xl p-3 border shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
                <Users className="h-5 w-5 text-primary relative z-10" />
              </div>
              <h3 className="font-bold text-card-foreground text-sm mb-1 group-hover:text-primary transition-colors">Match & Plan</h3>
              <p className="text-xs text-muted-foreground leading-tight">Find compatible roommates</p>
            </div>
          </div>
          
          <div className="text-center space-y-2 group">
            <div className="bg-card rounded-2xl p-3 border shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-100/50 to-green-100/20 rounded-full flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-green-100/30 rounded-full animate-pulse opacity-30"></div>
                <Home className="h-5 w-5 text-green-600 relative z-10" />
              </div>
              <h3 className="font-bold text-card-foreground text-sm mb-1 group-hover:text-green-600 transition-colors">Rent or Buy</h3>
              <p className="text-xs text-muted-foreground leading-tight">Explore rental options</p>
            </div>
          </div>
          
          <div className="text-center space-y-2 group">
            <div className="bg-card rounded-2xl p-3 border shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100/50 to-purple-100/20 rounded-full flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-purple-100/30 rounded-full animate-pulse opacity-30"></div>
                <CreditCard className="h-5 w-5 text-purple-600 relative z-10" />
              </div>
              <h3 className="font-bold text-card-foreground text-sm mb-1 group-hover:text-purple-600 transition-colors">Apply & Pay</h3>
              <p className="text-xs text-muted-foreground leading-tight">Submit applications</p>
            </div>
          </div>
          
          <div className="text-center space-y-2 group">
            <div className="bg-card rounded-2xl p-3 border shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100/50 to-orange-100/20 rounded-full flex items-center justify-center mx-auto mb-2 relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-orange-100/30 rounded-full animate-pulse opacity-30"></div>
                <HelpCircle className="h-5 w-5 text-orange-600 relative z-10" />
              </div>
              <h3 className="font-bold text-card-foreground text-sm mb-1 group-hover:text-orange-600 transition-colors">Support & Growth</h3>
              <p className="text-xs text-muted-foreground leading-tight">Access help & education</p>
            </div>
          </div>
        </div>

        {/* Transition Line */}
        <div className="text-center pt-4 border-t relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-foreground text-sm font-medium">
              Explore the sections below to access each part of your Roomie AI experience.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Matches Master Box */}
        <MasterBox
          title="Matches"
          description="AI-powered roommate compatibility and planning tools."
          icon={Users}
          onClick={() => navigate("/dashboard/matches")}
        >
          <div className="space-y-1">
            <SubFeatureButton 
              emoji="❤️" 
              label="About Me"
              onClick={() => navigate("/dashboard/profile")}
            />
            <SubFeatureButton 
              emoji="🔍" 
              label="Ideal Roommate"
              onClick={() => navigate("/dashboard/roommate-recommendations")}
            />
            <SubFeatureButton 
              emoji="📅" 
              label="View Matches"
              onClick={() => navigate("/dashboard/matches")}
            />
            <SubFeatureButton 
              emoji="📅" 
              label="Plan Ahead"
              onClick={() => navigate("/dashboard/plan-ahead-matching")}
            />
            <SubFeatureButton 
              emoji="🌙" 
              label="Opposite Schedule"
              onClick={() => navigate("/dashboard/opposite-schedule")}
            />
            <SubFeatureButton 
              emoji="💼" 
              label="Work Exchange"
              onClick={() => navigate("/dashboard/work-exchange")}
            />
          </div>
        </MasterBox>
        
        {/* Rental Options Master Box */}
        <MasterBox
          title="Rental Options"
          description="Browse available rental listings and recommendations."
          icon={Home}
          onClick={() => navigate("/dashboard/rental-options")}
        />
        
        {/* My Applications Master Box */}
        <MasterBox
          title="My Applications"
          description="Track rental applications, statuses, and decisions."
          icon={FileText}
          onClick={() => navigate("/dashboard/applications")}
        />
        
        {/* Payments Master Box */}
        <MasterBox
          title="Payments"
          description="Rent payments, digital wallet, and transaction history."
          icon={CreditCard}
          onClick={() => navigate("/dashboard/digital-wallet")}
        />
        
        {/* Buying Opportunities Master Box */}
        <MasterBox
          title="Buying Opportunities"
          description="Alternative paths to ownership through Roomie AI."
          icon={TrendingUp}
          onClick={() => navigate("/dashboard/buying-opportunities")}
        >
          <div className="space-y-1">
            <SubFeatureButton 
              emoji="🤝" 
              label="Co-ownership"
              onClick={() => navigate("/dashboard/co-ownership-guide")}
            />
            <SubFeatureButton 
              emoji="🏠" 
              label="Buy Unit"
              onClick={() => navigate("/dashboard/buying-opportunities")}
            />
          </div>
        </MasterBox>
        
        {/* Renovators Master Box */}
        <MasterBox
          title="Renovators"
          description="Access trusted renovators and request emergency or planned renovations."
          icon={Hammer}
          onClick={() => navigate("/dashboard/renovators")}
        />
        
        {/* Education Centre Master Box */}
        <MasterBox
          title="Education Centre"
          description="Learn about renting, rights, ownership, and financial literacy."
          icon={BookOpen}
          onClick={() => navigate("/dashboard/education-centre")}
        />
        
        {/* AI Legal Assistant Master Box */}
        <MasterBox
          title="AI Legal Assistant"
          description="Instant legal guidance for rental, housing, and disputes."
          icon={Bot}
          onClick={() => navigate("/dashboard/legal-ai")}
        />
        
        {/* Space for more Master Boxes */}
        
      </div>
    </div>
  );
}
