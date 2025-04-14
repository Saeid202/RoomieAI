
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ChatMessageType = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user";
  
  return (
    <div
      className={cn(
        "flex items-start gap-2 p-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className={isUser ? "bg-blue-100" : "bg-purple-100"}>
          {isUser ? "U" : "AI"}
        </AvatarFallback>
        {!isUser && (
          <AvatarImage src="/avatar-ai.png" alt="AI Assistant" />
        )}
      </Avatar>
      
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[80%]",
          isUser ? "bg-blue-100 text-blue-900" : "bg-roomie-purple/10 text-gray-900"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <span className="text-xs text-muted-foreground mt-1 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
