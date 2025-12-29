
import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationWithMessages } from "@/types/messaging";

export default function Messages() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);

    return (
        <div className="container mx-auto p-6 space-y-6 h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your communications with clients
                </p>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                <div className="w-80 flex-shrink-0 h-full">
                    <ConversationList
                        selectedConversationId={selectedConversation?.id}
                        onSelectConversation={setSelectedConversation}
                        className="h-full"
                    />
                </div>
                <div className="flex-1 min-w-0 h-full">
                    <ChatWindow
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
}
