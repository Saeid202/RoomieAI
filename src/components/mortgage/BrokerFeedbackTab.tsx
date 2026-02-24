import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchProfileFeedback, 
  sendFeedbackMessage, 
  markMessagesAsRead,
  subscribeToFeedback,
  updateReviewStatus
} from "@/services/mortgageFeedbackService";
import { MortgageProfileFeedback, ReviewStatus } from "@/types/mortgage";
import { MessageCircle, Send, CheckCircle, Clock } from "lucide-react";

interface BrokerFeedbackTabProps {
  profileId: string;
  currentStatus: ReviewStatus;
  isBroker: boolean;
}

export function BrokerFeedbackTab({ profileId, currentStatus, isBroker }: BrokerFeedbackTabProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MortgageProfileFeedback[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(currentStatus);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    fetchCurrentStatus();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToFeedback(profileId, (newFeedback) => {
      setMessages(prev => [...prev, newFeedback]);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [profileId]);

  useEffect(() => {
    scrollToBottom();
    markUnreadMessages();
  }, [messages]);

  const fetchCurrentStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('mortgage_profiles')
        .select('review_status')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      if (data?.review_status) {
        setReviewStatus(data.review_status as ReviewStatus);
      }
    } catch (error) {
      console.error("Error fetching review status:", error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchProfileFeedback(profileId);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const markUnreadMessages = async () => {
    if (!user) return;
    
    const unreadIds = messages
      .filter(m => !m.is_read && m.sender_id !== user.id)
      .map(m => m.id);
    
    if (unreadIds.length > 0) {
      try {
        await markMessagesAsRead(unreadIds);
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately
    const optimisticMessage: MortgageProfileFeedback = {
      id: tempId,
      profile_id: profileId,
      sender_id: user.id,
      message: messageText,
      section: 'general',
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_name: user.user_metadata?.full_name || user.email || 'You',
      sender_role: user.user_metadata?.role || 'user'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      setSending(true);
      const sentMessage = await sendFeedbackMessage(profileId, messageText, 'general');
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageText); // Restore the message text
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: ReviewStatus) => {
    try {
      await updateReviewStatus(profileId, newStatus);
      setReviewStatus(newStatus);
      toast.success("Status updated successfully");
      
      // Refresh the status from database to confirm
      await fetchCurrentStatus();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const statusConfig = {
      pending_review: { color: "bg-gray-500", icon: Clock, label: "Pending Review" },
      under_review: { color: "bg-blue-500", icon: Clock, label: "Under Review" },
      feedback_sent: { color: "bg-purple-500", icon: MessageCircle, label: "Reviewed" },
      under_discussion: { color: "bg-purple-500", icon: MessageCircle, label: "Under Discussion" },
      approved: { color: "bg-purple-500", icon: CheckCircle, label: "Reviewed" },
      rejected: { color: "bg-purple-500", icon: CheckCircle, label: "Reviewed" }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white px-4 py-2 text-sm font-bold`}>
        <Icon className="h-4 w-4 mr-2" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Review Status</h3>
              {getStatusBadge(reviewStatus)}
            </div>
            
            {isBroker && reviewStatus !== 'feedback_sent' && (
              <Button
                onClick={() => handleStatusChange('feedback_sent')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Reviewed
              </Button>
            )}
            
            {isBroker && reviewStatus === 'feedback_sent' && (
              <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                <CheckCircle className="h-4 w-4" />
                <span>Review Complete</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-semibold">No messages yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  {isBroker 
                    ? "Start the conversation by sending feedback to the client" 
                    : "Your mortgage broker will review your profile and send feedback here"}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                const isBrokerMessage = message.sender_role === 'mortgage_broker';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {isOwnMessage ? 'You' : message.sender_name}
                        </span>
                        {isBrokerMessage && !isOwnMessage && (
                          <Badge className="bg-purple-500 text-white text-xs">Broker</Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isBroker ? "Send feedback to the client..." : "Reply to your broker..."}
              className="flex-1 min-h-[100px] border-2 border-purple-200 focus:border-purple-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold h-auto px-6"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </CardContent>
      </Card>
    </div>
  );
}
