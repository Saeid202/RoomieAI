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
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 bg-muted/20">
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground">Manage your conversations</p>
        </div>
      </div>

      <div className="flex-1 bg-background rounded-[2rem] border shadow-xl overflow-hidden flex max-w-7xl mx-auto w-full">
        {/* Sidebar List - Hidden on mobile if conversation selected */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r bg-muted/10 ${selectedConversation ? "hidden md:flex" : "flex"
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ConversationList
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              className="h-full bg-transparent"
            />
          )}
        </div>

        {/* Chat Window - Hidden on mobile if no conversation selected */}
        <div
          className={`flex-1 min-w-0 bg-background relative ${!selectedConversation ? "hidden md:flex" : "flex"
            }`}
        >
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
