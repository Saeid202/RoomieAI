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
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-2 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 opacity-50 rotate-45 animate-spin-slow"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-300/50 to-orange-300/50 rounded-full blur-xl animate-bounce delay-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-pink-300/50 to-purple-300/50 rounded-full blur-lg animate-ping delay-700"></div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-1 relative z-10">
          <div className="inline-block bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              Welcome to Roomie AI
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg"></div>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto font-bold leading-relaxed">
              Your all-in-one platform for renting, matching, paying, and building your future.
            </p>
          </div>
        </div>

        {/* Short Explanation */}
        <div className="text-center relative z-10">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 border-2 border-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-gray-800 text-lg leading-relaxed relative z-10 font-medium">
              Roomie AI brings every step of rental journey into one secure platform — from finding the right roommate or home, to applying, paying rent, and accessing legal, financial, and educational support. The sections below guide you through each stage.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Matches Master Box */}
        <MasterBox
          title="1. Matches"
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
          title="2. Rental Options"
          description="Browse available rental listings and recommendations."
          icon={Home}
          onClick={() => navigate("/dashboard/rental-options")}
        />
        
        {/* My Applications Master Box */}
        <MasterBox
          title="3. My Applications"
          description="Track rental applications, statuses, and decisions."
          icon={FileText}
          onClick={() => navigate("/dashboard/applications")}
        />
        
        {/* Payments Master Box */}
        <MasterBox
          title="4. Payments"
          description="Rent payments, digital wallet, and transaction history."
          icon={CreditCard}
          onClick={() => navigate("/dashboard/digital-wallet")}
        />
        
        {/* Buying Opportunities Master Box */}
        <MasterBox
          title="5. Buying Opportunities"
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
          title="6. Renovators"
          description="Access trusted renovators and request emergency or planned renovations."
          icon={Hammer}
          onClick={() => navigate("/dashboard/renovators")}
        />
        
        {/* Education Centre Master Box */}
        <MasterBox
          title="7. Education Centre"
          description="Learn about renting, rights, ownership, and financial literacy."
          icon={BookOpen}
          onClick={() => navigate("/dashboard/education-centre")}
        />
        
        {/* AI Legal Assistant Master Box */}
        <MasterBox
          title="8. AI Legal Assistant"
          description="Instant legal guidance for rental, housing, and disputes."
          icon={Bot}
          onClick={() => navigate("/dashboard/legal-ai")}
        />
        
        {/* Space for more Master Boxes */}
        
      </div>
    </div>
  );
}
