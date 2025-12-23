
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-slate-600" />
                <h1 className="text-3xl font-bold">Messages</h1>
            </div>

            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    <p>No active conversations.</p>
                </CardContent>
            </Card>
        </div>
    );
}
