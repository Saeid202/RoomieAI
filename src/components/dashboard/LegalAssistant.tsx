
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Scale, AlertCircle, Shield, FileText, Home, Users, Gavel } from "lucide-react";
import { useState } from "react";

export function LegalAssistant() {
  const [question, setQuestion] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be integrated with an actual AI service in production
    console.log("Question submitted:", question);
    setQuestion("");
  };

  const popularTopics = [
    { icon: Home, label: "Harassment / Illegal entry", color: "bg-blue-600" },
    { icon: FileText, label: "Repairs / mold / pests", color: "bg-purple-600" },
    { icon: Gavel, label: "Illegal fees / rent", color: "bg-green-600" },
    { icon: Users, label: "Lease Services", color: "bg-orange-600" },
    { icon: Shield, label: "Bad-faith eviction", color: "bg-red-600" },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            <Scale className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gradient">
              AI Legal Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Get instant answers about tenancy law and your rights
            </p>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Disclaimer:</p>
            <p className="text-sm text-amber-800">
              This AI provides general information about tenancy law for educational purposes only. It is not legal advice. Laws vary by state and jurisdiction. For specific legal matters, please consult with a qualified attorney.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <section className="mb-6">
        <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-400">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</span>
            <Label className="text-sm font-semibold text-slate-900">Popular Topics</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {popularTopics.map((topic, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                onClick={() => setQuestion(`Tell me about ${topic.label.toLowerCase()}`)}
              >
                <div className={`${topic.color} p-3 rounded-full`}>
                  <topic.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">{topic.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Assistant Chat */}
      <section className="mb-6">
        <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-400">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</span>
            <Label className="text-sm font-semibold text-slate-900">Legal Assistant Chat</Label>
          </div>
          
          <div className="bg-white rounded-lg border-2 border-slate-300 p-4">
            <div className="min-h-[400px] flex flex-col">
              <div className="flex-1 p-4 bg-slate-50 rounded-lg mb-4 overflow-y-auto">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-purple-200 inline-block mb-2 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-purple-600" />
                    <p className="font-bold text-sm text-purple-900">Legal Assistant</p>
                  </div>
                  <p className="text-sm text-slate-700">
                    Hello! I'm your AI legal assistant. I can help with questions about housing rights, rental agreements, co-ownership, and more. What would you like to know?
                  </p>
                </div>
                
                {/* This would be a component for chat messages in production */}
              </div>
              
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input 
                  placeholder="Ask about tenant rights, lease agreements, etc..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 h-12 border-2 border-slate-300 font-medium"
                />
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white h-12 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
