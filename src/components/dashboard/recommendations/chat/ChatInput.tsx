
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="p-3 border-t">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about roommate matching..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
