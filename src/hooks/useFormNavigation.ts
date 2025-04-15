
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";

export function useFormNavigation(form: UseFormReturn<any>, totalSteps: number) {
  const [step, setStep] = useState(1);

  const nextStep = async () => {
    // Get all field names for the current step
    const fieldNames = Object.keys(form.getValues());
    
    // Check if the current step is valid
    const isStepValid = await form.trigger();
    
    if (isStepValid && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= totalSteps) {
      setStep(newStep);
      window.scrollTo(0, 0);
    }
  };

  return {
    step,
    nextStep,
    prevStep,
    goToStep,
  };
}
