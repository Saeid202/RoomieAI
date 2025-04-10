
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatsPage() {
  useEffect(() => {
    document.title = "Chats | RoomieMatch";
  }, []);
  
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Your Chats</CardTitle>
          <CardDescription>Connect with your matches and potential roommates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">
            No active chats yet. Start a conversation with your matches!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
