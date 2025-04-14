
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface FormButtonsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isSubmitStep: boolean;
  submitLabel?: string;
}

export function FormButtons({
  step,
  totalSteps,
  onPrev,
  onNext,
  isSubmitStep,
  submitLabel = "Submit"
}: FormButtonsProps) {
  return (
    <div className="flex justify-between w-full">
      {step > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div className="w-24"></div>
      )}

      <div className="flex-1 text-center">
        <span className="text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </span>
      </div>

      {isSubmitStep ? (
        <Button type="submit" className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          {submitLabel}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
