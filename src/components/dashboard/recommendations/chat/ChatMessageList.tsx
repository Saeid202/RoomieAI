
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatMessageType } from "./ChatMessage";

interface ChatMessageListProps {
  messages: ChatMessageType[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <ScrollArea className="h-60 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  );
}
