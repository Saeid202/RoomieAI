
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  onSave: () => void;
}

export function FormActions({ onCancel, onSave }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave}>
        Save Plan
      </Button>
    </div>
  );
}
