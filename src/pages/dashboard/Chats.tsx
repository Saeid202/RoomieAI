import { useState, useEffect } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationWithMessages } from "@/types/messaging";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ChatsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);

  // Load conversations and auto-select if conversation ID is in URL
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { MessagingService } = await import('@/services/messagingService');
        const data = await MessagingService.getConversations();
        setConversations(data);
        
        // Auto-select conversation from URL
        const conversationId = searchParams.get('conversation');
        if (conversationId) {
          const conversation = data.find(c => c.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
          }
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
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
          <p className="text-muted-foreground">You need to be logged in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Conversations loaded: {conversations.length}</p>
        <p>Selected conversation: {selectedConversation?.id || 'None'}</p>
        <p>URL conversation param: {searchParams.get('conversation') || 'None'}</p>
        <p>User: {user?.email || 'Not logged in'}</p>
        <button 
          className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
          onClick={async () => {
            try {
              console.log('Testing database connection...');
              const { data, error } = await supabase
                .from('conversations' as any)
                .select('count')
                .limit(1);
              
              if (error) {
                console.error('Database test failed:', error);
                alert('Database test failed: ' + error.message);
              } else {
                console.log('Database test successful:', data);
                alert('Database test successful!');
              }
            } catch (err) {
              console.error('Database test error:', err);
              alert('Database test error: ' + err.message);
            }
          }}
        >
          Test Database Connection
        </button>
      </div>
      
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        <div className="w-80 flex-shrink-0">
          <ConversationList
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
          />
        </div>
        <div className="flex-1">
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    </div>
  );
}