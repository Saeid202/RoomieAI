
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

export function LegalAssistant() {
  const [question, setQuestion] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be integrated with an actual AI service in production
    console.log("Question submitted:", question);
    setQuestion("");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Legal Assistant</h1>
        <p className="text-muted-foreground mt-2">Get free legal guidance and assistance for housing matters</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Ask Legal Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-col">
            <div className="flex-1 p-4 bg-gray-50 rounded-md mb-4 overflow-y-auto">
              <div className="bg-white p-3 rounded-lg shadow-sm inline-block mb-2">
                <p className="font-medium text-sm text-roomie-purple">Legal Assistant</p>
                <p>Hello! I'm your AI legal assistant. I can help with questions about housing rights, rental agreements, co-ownership, and more. What would you like to know?</p>
              </div>
              
              {/* This would be a component for chat messages in production */}
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input 
                placeholder="Ask about tenant rights, lease agreements, etc..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Send size={18} />
              </Button>
            </form>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Disclaimer: This AI assistant provides general information only and is not a substitute for professional legal advice.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
