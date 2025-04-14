
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FutureHousingPlan } from "./types";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { PlanCreationForm } from "./PlanCreationForm";

interface PlanCardProps {
  plan: FutureHousingPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const { showSuccess } = useToastNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<Partial<FutureHousingPlan>>(plan);
  
  // Helper for date display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
    console.log("Editing plan:", plan.id);
  };

  // Handle save edited plan
  const handleSaveEdit = () => {
    setIsEditing(false);
    showSuccess(
      "Plan updated",
      "Your housing plan has been updated successfully"
    );
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPlan(plan); // Reset to original plan
  };

  // Handle view matches button click
  const handleViewMatches = () => {
    showSuccess(
      "Viewing matches",
      "Loading matches for your housing plan"
    );
    console.log("Viewing matches for plan:", plan.id);
  };

  if (isEditing) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <PlanCreationForm
            newPlan={editedPlan}
            setNewPlan={setEditedPlan}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between border-b">
        <div className="flex items-center space-x-3">
          <Badge 
            className={
              plan.status === 'active' ? 'bg-green-500' : 
              plan.status === 'pending' ? 'bg-yellow-500' : 
              plan.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
            }
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
          <h4 className="font-semibold text-lg">{plan.location}</h4>
        </div>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <span className="text-sm text-muted-foreground">
            Looking for: {plan.lookingFor === 'both' ? 'Roommate & Property' : plan.lookingFor}
          </span>
          <Badge variant="outline" className="rounded-full bg-blue-50">
            {formatDate(plan.moveInDate)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Purpose</p>
            <p className="font-medium">{plan.purpose}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-medium">${plan.budgetRange[0]} - ${plan.budgetRange[1]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date Flexibility</p>
            <p className="font-medium">±{plan.flexibilityDays} days around {formatDate(plan.moveInDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Notifications</p>
            <p className="font-medium">{
              plan.notificationPreference === 'both' ? 'Email & In-App' : 
              plan.notificationPreference === 'email' ? 'Email Only' : 'In-App Only'
            }</p>
          </div>
          {plan.additionalNotes && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Additional Notes</p>
              <p className="font-medium">{plan.additionalNotes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" size="sm" onClick={handleEdit}>Edit</Button>
          <Button variant="default" size="sm" onClick={handleViewMatches}>View Matches</Button>
        </div>
      </CardContent>
    </Card>
  );
}
