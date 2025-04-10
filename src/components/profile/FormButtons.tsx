
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface FormButtonsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isSubmitStep: boolean;
  submitLabel?: string;
}

export function FormButtons({ step, totalSteps, onPrev, onNext, isSubmitStep, submitLabel = "Find Matches" }: FormButtonsProps) {
  return (
    <div className="w-full flex justify-between">
      {step > 1 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </Button>
      ) : (
        <div></div> // Empty div to maintain layout with flex justify-between
      )}
      
      {isSubmitStep ? (
        <Button type="submit" className="bg-roomie-purple hover:bg-roomie-dark text-white">
          {submitLabel}
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onNext}
          className="bg-roomie-purple hover:bg-roomie-dark text-white flex items-center gap-2"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
}
