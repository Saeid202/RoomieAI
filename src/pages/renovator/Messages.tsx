
import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatWindow } from "@/components/ChatWindow";
import { ConversationWithMessages } from "@/types/messaging";

export default function Messages() {
    const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);

    return (
        <div className="h-[calc(100vh-80px)] overflow-hidden bg-white dark:bg-slate-950">
            <div className="h-full flex flex-col w-full bg-white/40 dark:bg-slate-900/40">
                <div className="flex-1 min-h-0 flex gap-0 overflow-hidden border-t border-slate-200/50 dark:border-slate-800">
                    <div className="w-[380px] flex-shrink-0 h-full border-r border-slate-100 dark:border-slate-800">
                        <ConversationList
                            selectedConversationId={selectedConversation?.id}
                            onSelectConversation={setSelectedConversation}
                            className="h-full"
                        />
                    </div>
                    <div className="flex-1 min-w-0 h-full bg-white dark:bg-slate-950">
                        <ChatWindow
                            conversation={selectedConversation}
                            onBack={() => setSelectedConversation(null)}
                            className="h-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
