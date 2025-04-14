
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface ChatMessageType {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.sender === "ai";
  
  return (
    <div
      className={cn(
        "flex w-full gap-2 p-4",
        isAI ? "bg-muted/50" : ""
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={isAI ? "/assets/ai-avatar.png" : ""} alt={isAI ? "AI" : "You"} />
        <AvatarFallback>{isAI ? "AI" : "You"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{isAI ? "AI Assistant" : "You"}</span>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, "h:mm a")}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
