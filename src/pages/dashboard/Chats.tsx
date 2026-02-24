import { useState, useEffect } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationWithMessages } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { MessagingService } from "@/services/messagingService";

export default function ChatsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithMessages | null>(null);
  const [conversations, setConversations] = useState<
    ConversationWithMessages[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Load conversations and auto-select if conversation ID is in URL
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const data = await MessagingService.getConversations();
        setConversations(data);

        // Auto-select conversation from URL
        const conversationId = searchParams.get("conversation");
        if (conversationId) {
          let conversation = data.find((c) => c.id === conversationId);

          // If conversation not found in list, try to load it directly
          if (!conversation) {
            try {
              conversation = await MessagingService.getConversationById(
                conversationId
              );
              if (conversation) {
                // Add to conversations list if not already there
                setConversations((prev) => {
                  const exists = prev.find((c) => c.id === conversationId);
                  return exists ? prev : [...prev, conversation!];
                });
              }
            } catch (error) {
              console.error("Failed to load conversation:", error);
            }
          }

          if (conversation) {
            setSelectedConversation(conversation);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [searchParams]);

  const handleSelectConversation = (conversation: ConversationWithMessages) => {
    setSelectedConversation(conversation);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">
            You need to be logged in to access messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-indigo-50/50">
      {/* Animated Header Banner */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl mx-4 mt-4 p-8 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-400/20 via-pink-400/20 to-purple-400/20 opacity-50 rotate-45"></div>
        </div>

        {/* Header Content */}
        <div className="relative z-10 text-center">
          <div className="inline-block bg-white/90 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/50 shadow-xl">
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Professional Communications
            </h1>
            <div className="h-2 w-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto mt-2 shadow-lg"></div>
            <p className="text-lg text-gray-700 font-semibold mt-2">
              Connect with roommates, landlords, and professionals in a secure, business-oriented environment
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="mx-4 mt-6 mb-4 h-[calc(100vh-280px)] overflow-hidden">
        <div className="h-full flex gap-4">
          {/* Sidebar List - Hidden on mobile if conversation selected */}
          <div
            className={`w-[380px] flex-shrink-0 h-full ${selectedConversation ? "hidden md:flex" : "flex"
              }`}
          >
            <div className="w-full h-full rounded-2xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading conversations...</p>
                  </div>
                </div>
              ) : (
                <ConversationList
                  selectedConversationId={selectedConversation?.id}
                  onSelectConversation={handleSelectConversation}
                  className="h-full"
                />
              )}
            </div>
          </div>

          {/* Chat Window - Hidden on mobile if no conversation selected */}
          <div
            className={`flex-1 min-w-0 h-full ${!selectedConversation ? "hidden md:flex" : "flex"
              }`}
          >
            <div className="w-full h-full rounded-2xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <ChatWindow
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
