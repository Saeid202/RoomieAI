
import { Avatar } from "@/components/ui/avatar";

export type ChatMessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div 
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start max-w-[75%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
          <div className={message.role === 'assistant' ? "bg-roomie-purple text-white w-full h-full flex items-center justify-center" : "bg-gray-200 w-full h-full flex items-center justify-center"}>
            {message.role === 'assistant' ? 'AI' : 'You'}
          </div>
        </Avatar>
        <div 
          className={`rounded-lg p-3 text-sm ${
            message.role === 'assistant' 
              ? 'bg-muted/50 text-foreground' 
              : 'bg-roomie-purple/80 text-white'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
