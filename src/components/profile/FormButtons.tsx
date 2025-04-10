
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isSubmitStep: boolean;
}

export function FormButtons({ 
  step, 
  totalSteps, 
  onPrev, 
  onNext, 
  isSubmitStep 
}: FormButtonsProps) {
  return (
    <div className="flex justify-between mt-4 pt-4 border-t">
      {step > 1 ? (
        <Button type="button" variant="outline" onClick={onPrev}>
          Back
        </Button>
      ) : (
        <div></div>
      )}
      
      {step < totalSteps ? (
        <Button type="button" className="bg-roomie-purple hover:bg-roomie-dark" onClick={onNext}>
          Continue
        </Button>
      ) : (
        <Button type="submit" className="bg-roomie-purple hover:bg-roomie-dark">
          Find Matches
        </Button>
      )}
    </div>
  );
}
