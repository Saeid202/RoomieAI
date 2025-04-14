
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AuthError() {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to be logged in to view your housing plans.
          </p>
          <Button 
            className="bg-roomie-purple hover:bg-roomie-purple/90 px-6"
            onClick={() => navigate("/auth")}
          >
            Log In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
