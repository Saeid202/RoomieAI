import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LawyerProfile } from "@/types/lawyer";
import { LawyerProfileCard } from "@/components/lawyer/LawyerProfileCard";
import { MessagingService } from "@/services/messagingService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function FindLawyer() {
  const [loading, setLoading] = useState(true);
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [startingConversation, setStartingConversation] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lawyer_profiles' as any)
        .select('*')
        .eq('is_accepting_clients', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLawyers(data || []);
    } catch (error) {
      console.error("Error loading lawyers:", error);
      toast.error("Failed to load lawyers");
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (lawyer: LawyerProfile) => {
    if (!user) {
      toast.error("Please log in to start a conversation");
      return;
    }

    try {
      setStartingConversation(true);
      
      // Create conversation in main messenger
      const conversationId = await MessagingService.startLawyerConsultation(
        lawyer.user_id,
        lawyer.id,
        user.id,
        { 
          consultationType: 'general', 
          topic: 'Real Estate Legal Services' 
        }
      );

      // Redirect to main messenger with conversation pre-selected
      navigate(`/dashboard/chats?conversation=${conversationId}`);
      toast.success(`Connected with ${lawyer.full_name}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setStartingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p>Loading lawyers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Loading Overlay */}
      {startingConversation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">Starting conversation...</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to messenger</p>
          </div>
        </div>
      )}
      {/* Luxury Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-pink-800 to-indigo-900 text-white">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-screen-xl mx-auto px-4 py-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-semibold tracking-wide">LEGAL SERVICES</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Meet Your Real Estate Lawyer
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto font-light leading-relaxed">
            Expert legal guidance for your property journey
          </p>

          {/* Decorative Divider */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/50"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Lawyer Cards */}
        {lawyers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No lawyers available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((lawyer) => (
            <LawyerProfileCard
              key={lawyer.id}
              lawyer={lawyer}
              onStartConversation={handleStartConversation}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
