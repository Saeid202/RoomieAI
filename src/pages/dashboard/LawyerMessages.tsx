import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Loader2, User, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { shouldMigrateToMainMessenger } from "@/services/lawyerMessagingService";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
}

interface Conversation {
  client_id: string;
  client_name: string;
  client_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function LawyerMessages() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectConversationId, setRedirectConversationId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get lawyer profile
      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      // Fetch all messages for this lawyer
      const { data: messagesData, error } = await supabase
        .from('lawyer_messages')
        .select('*')
        .eq('lawyer_profile_id', lawyerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by client (sender who is not the lawyer)
      const conversationsMap = new Map<string, Conversation>();
      
      (messagesData || []).forEach((msg: any) => {
        const clientId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (!conversationsMap.has(clientId)) {
          // Fetch client email from auth.users
          conversationsMap.set(clientId, {
            client_id: clientId,
            client_name: 'Client',
            client_email: '',
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: msg.recipient_id === user.id && !msg.read ? 1 : 0,
          });
        } else {
          const conv = conversationsMap.get(clientId)!;
          if (msg.recipient_id === user.id && !msg.read) {
            conv.unread_count++;
          }
        }
      });

      // Fetch client details for each conversation
      const conversationsList = Array.from(conversationsMap.values());
      for (const conv of conversationsList) {
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('user_id', conv.client_id)
          .single();
        
        if (userData) {
          conv.client_name = userData.full_name || userData.email?.split('@')[0] || 'Client';
          conv.client_email = userData.email || '';
        }
      }

      setConversations(conversationsList);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (clientId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      const { data, error } = await supabase
        .from('lawyer_messages')
        .select('*')
        .eq('lawyer_profile_id', lawyerProfile.id)
        .or(`sender_id.eq.${clientId},recipient_id.eq.${clientId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      await supabase
        .from('lawyer_messages')
        .update({ read: true })
        .eq('lawyer_profile_id', lawyerProfile.id)
        .eq('sender_id', clientId)
        .eq('recipient_id', user.id)
        .eq('read', false);

      // Refresh conversations to update unread count
      loadConversations();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lawyerProfile } = await supabase
        .from('lawyer_profiles' as any)
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!lawyerProfile) return;

      const { data: newMsg } = await supabase
        .from('lawyer_messages' as any)
        .insert({
          sender_id: user.id,
          recipient_id: selectedConversation,
          lawyer_profile_id: (lawyerProfile as any).id,
          message: newMessage.trim(),
        })
        .select()
        .single();

      // Optimistically add message to UI without reloading
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
      }
      
      setNewMessage("");

      // Check if we should migrate to main messenger after sending
      const migrationCheck = await shouldMigrateToMainMessenger(user.id, selectedConversation);
      if (migrationCheck.shouldMigrate && migrationCheck.conversationId) {
        setShouldRedirect(true);
        setRedirectConversationId(migrationCheck.conversationId);
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
      navigate(`/dashboard/chats?conversation=${redirectConversationId}`);
      toast.success("Conversation moved to main messenger");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Client Messages
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No messages yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <div
                    key={conv.client_id}
                    onClick={() => setSelectedConversation(conv.client_id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConversation === conv.client_id
                        ? 'bg-purple-50 border-l-4 border-purple-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {conv.client_name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 truncate">{conv.client_name}</p>
                          {conv.unread_count > 0 && (
                            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conv.last_message_time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {!selectedConversation ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a conversation to view messages</p>
              </div>
            </CardContent>
          ) : (
            <>
              {/* Redirect Banner */}
              {shouldRedirect && (
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg mb-4">
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

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                  const isLawyer = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isLawyer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isLawyer
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isLawyer ? 'text-purple-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your reply..."
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
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
