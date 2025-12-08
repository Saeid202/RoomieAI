import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function ShowAllMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages" as any)
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
      } else {
        setMessages(data);
      }
    };
    const unsubscribe = subscribeToMessages(
      "a67f7326-1518-4a43-ae18-cffdbf70a397"
    );
    loadMessages();
    return () => {
      unsubscribe();
    };
  }, []);

  const subscribeToMessages = (conversationId: string): (() => void) => {
    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    const { data, error } = await supabase.from("messages" as any).insert({
      conversation_id: "a67f7326-1518-4a43-ae18-cffdbf70a397",
      content: msgInput,
      sender_id: user?.id,
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      console.log("Message sent:", data);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={msgInput}
        onChange={(e) => setMsgInput(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2"
      />
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 text-white rounded-md p-2"
      >
        send message
      </button>

      {messages.map((message) => (
        <div key={message.id}>
          <p>{message.sender_id}</p>
          <p>{message.content}</p>
          <p>{new Date(message.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
