import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LawyerProfile } from "@/types/lawyer";
import { 
  sendMessageToLawyer, 
  fetchConversationMessages, 
  markMessagesAsRead,
  LawyerMessage,
  shouldMigrateToMainMessenger
} from "@/services/lawyerMessagingService";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface LawyerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: LawyerProfile;
}

export function LawyerChatModal({ isOpen, onClose, lawyer }: LawyerChatModalProps) {
  const [messages, setMessages] = useState<LawyerMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectConversationId, setRedirectConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      getCurrentUser();
    }
  }, [isOpen, lawyer.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchConversationMessages(lawyer.id);
      setMessages(data);
      await markMessagesAsRead(lawyer.id);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const newMsg = await sendMessageToLawyer(lawyer.user_id, lawyer.id, newMessage.trim());
      
      // Optimistically add message to UI without reloading
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
      
      setNewMessage("");

      // Check if we should migrate to main messenger after sending
      if (currentUserId) {
        const migrationCheck = await shouldMigrateToMainMessenger(lawyer.user_id, currentUserId);
        if (migrationCheck.shouldMigrate && migrationCheck.conversationId) {
          setShouldRedirect(true);
          setRedirectConversationId(migrationCheck.conversationId);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleRedirectToMainMessenger = () => {
    if (redirectConversationId) {
      onClose();
      navigate(`/dashboard/chats?conversation=${redirectConversationId}`);
      toast.success("Conversation moved to main messenger");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "L";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                {getInitials(lawyer.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{lawyer.full_name}</DialogTitle>
              {lawyer.law_firm_name && (
                <p className="text-sm text-purple-600 font-semibold">{lawyer.law_firm_name}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {/* Redirect Banner */}
          {shouldRedirect && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold mb-1">Continue in Main Messenger</p>
                  <p className="text-sm text-purple-100">
                    Your conversation is now active. Continue chatting in the main messenger for a better experience.
                  </p>
                </div>
                <Button
                  onClick={handleRedirectToMainMessenger}
                  className="bg-white text-purple-600 hover:bg-purple-50 ml-4"
                  size="sm"
                >
                  Go to Messenger <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Start a conversation</p>
                <p className="text-sm">Send your first message to {lawyer.full_name}</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? "text-purple-100" : "text-gray-500"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none"
              rows={2}
              disabled={sending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
