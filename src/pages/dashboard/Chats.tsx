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
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Connect with landlords and tenants
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-12rem)] overflow-hidden">
          <div className="w-80 flex-shrink-0">
            <ConversationList
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
