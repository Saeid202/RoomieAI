
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

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
        "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="relative">
        <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shadow-sm">
          <AvatarFallback className={cn(
            "text-sm font-semibold transition-colors",
            isUser ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-blue-600 text-white"
          )}>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </AvatarFallback>
          {!isUser && (
            <AvatarImage src="/avatar-ai.png" alt="AI Assistant" />
          )}
        </Avatar>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
          isUser ? "bg-green-500" : "bg-blue-500"
        )} />
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[70%] space-y-1",
        isUser ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 shadow-sm border transition-all duration-200",
            isUser 
              ? "bg-slate-900 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200" 
              : "bg-white text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
          )}
        >
          <p className="text-sm leading-relaxed font-medium">{message.content}</p>
        </div>
        <span className={cn(
          "text-xs font-medium text-slate-400 dark:text-slate-500 px-1",
          isUser && "text-right"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
