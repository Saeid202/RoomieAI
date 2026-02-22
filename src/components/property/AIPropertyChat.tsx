// =====================================================
// AI Property Chat Component
// =====================================================
// Purpose: Interactive chat interface for buyers to ask
//          questions about property documents using RAG
// =====================================================

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  X, 
  Sparkles, 
  FileText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { 
  sendMessageToAI, 
  getConversationHistory,
  checkPropertyAIReadiness 
} from "@/services/aiPropertyAssistantService";
import type { 
  AIConversationMessage, 
  DocumentCitation 
} from "@/types/aiPropertyAssistant";

interface AIPropertyChatProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIPropertyChat({
  propertyId,
  isOpen,
  onClose,
}: AIPropertyChatProps) {
  const [messages, setMessages] = useState<AIConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isAIReady, setIsAIReady] = useState(false);
  const [showCitations, setShowCitations] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if AI is ready for this property
  useEffect(() => {
    const checkReadiness = async () => {
      try {
        const readinessData = await checkPropertyAIReadiness(propertyId);
        setReadiness(readinessData);
        setIsAIReady(readinessData.isReady);
        
        // Add welcome message if no history
        if (messages.length === 0 && !isLoadingHistory) {
          const welcomeMsg = getWelcomeMessage(readinessData);
          if (welcomeMsg) {
            setMessages([{
              id: 'welcome',
              role: 'assistant',
              content: welcomeMsg,
              timestamp: new Date().toISOString(),
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to check AI readiness:", error);
      }
    };

    if (isOpen) {
      checkReadiness();
    }
  }, [propertyId, isOpen, messages.length, isLoadingHistory]);

  // Load conversation history
  useEffect(() => {
    const loadHistory = async () => {
      if (!isOpen) return;
      
      setIsLoadingHistory(true);
      try {
        const history = await getConversationHistory(propertyId);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load conversation history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [propertyId, isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to UI immediately
    const userMsg: AIConversationMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      const response = await sendMessageToAI(propertyId, userMessage, messages);

      if (response.success && response.response) {
        // Add AI response to UI
        const aiMsg: AIConversationMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: response.response,
          citations: response.citations,
          timestamp: new Date().toISOString(),
          tokensUsed: response.tokensUsed,
          responseTime: response.responseTime,
        };
        setMessages(prev => [...prev, aiMsg]);
        
        // If this was a process command, refresh readiness after a delay
        if (userMessage.toLowerCase().includes('process')) {
          setTimeout(async () => {
            const newReadiness = await checkPropertyAIReadiness(propertyId);
            setReadiness(newReadiness);
            setIsAIReady(newReadiness.isReady);
          }, 2000);
        }
      } else {
        throw new Error(response.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get AI response. Please try again.");
      
      // Remove the user message if AI failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleCitations = (messageId: string) => {
    setShowCitations(prev => prev === messageId ? null : messageId);
  };

  const handleQuickAction = (text: string) => {
    setInputMessage(text);
    textareaRef.current?.focus();
  };

  const getWelcomeMessage = (readinessData: any): string => {
    if (!readinessData) return "";
    
    if (readinessData.totalDocuments === 0) {
      return "Hello! I'm your AI Property Assistant. Upload some documents first, then I can help you understand them.";
    }
    
    if (readinessData.processedDocuments === 0) {
      return `Hello! I see you have ${readinessData.totalDocuments} document(s) uploaded but not yet processed.\n\n💡 Type "process documents" to analyze them, then you can ask me questions!`;
    }
    
    if (readinessData.processingDocuments > 0) {
      return `Hello! I'm currently processing ${readinessData.processingDocuments} document(s). You can ask questions about the ${readinessData.processedDocuments} already completed, or wait for processing to finish!`;
    }
    
    return `Hello! All ${readinessData.totalDocuments} document(s) are ready. Ask me anything about this property!`;
  };

  const getQuickActions = (): string[] => {
    if (!readiness) return [];
    
    const actions: string[] = [];
    
    if (readiness.pendingDocuments > 0 || readiness.totalDocuments > readiness.processedDocuments) {
      actions.push("process documents");
    }
    
    if (readiness.processedDocuments > 0) {
      actions.push("What are the pet policies?");
      actions.push("Tell me about fees");
      actions.push("list documents");
    } else {
      actions.push("status");
      actions.push("help");
    }
    
    return actions;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Property Assistant</h2>
              <p className="text-xs text-indigo-100">
                {isAIReady ? "Ask me anything about this property" : "Processing documents..."}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageCircle className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Start a Conversation
              </h3>
              <p className="text-sm text-slate-500 max-w-md mb-6">
                Ask me anything about this property's documents. I can help you understand
                pet policies, fees, maintenance history, and more.
              </p>
              
              {/* Quick Action Buttons */}
              {getQuickActions().length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {getQuickActions().map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="text-xs"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Citations */}
                    {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <button
                          onClick={() => toggleCitations(message.id)}
                          className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          <FileText className="h-3 w-3" />
                          {message.citations.length} Source{message.citations.length > 1 ? "s" : ""}
                          {showCitations === message.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        
                        {showCitations === message.id && (
                          <div className="mt-2 space-y-2">
                            {message.citations.map((citation, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-slate-50 rounded p-2 border border-slate-200"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-[10px]">
                                    {citation.documentCategory}
                                  </Badge>
                                  <span className="text-slate-600 font-medium">
                                    {citation.documentType.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p className="text-slate-600 line-clamp-2">
                                  {citation.content}
                                </p>
                                {citation.pageNumber && (
                                  <p className="text-slate-400 mt-1">
                                    Page {citation.pageNumber}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <p className={`text-[10px] mt-2 ${
                      message.role === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span className="text-sm text-slate-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isAIReady 
                  ? "Ask about pet policies, fees, maintenance history..." 
                  : 'Type "process documents" to get started, or ask a question...'
              }
              className="resize-none min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            AI responses are based on uploaded documents. Always verify important details with the property owner.
          </p>
        </div>
      </Card>
    </div>
  );
}
