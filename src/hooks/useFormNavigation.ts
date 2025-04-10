
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { getFieldsForStep } from "@/utils/formSteps";

export function useFormNavigation(form: UseFormReturn<ProfileFormValues>, totalSteps: number) {
  const [step, setStep] = useState(1);
  
  const validateCurrentStep = async (currentStep: number) => {
    const currentStepFields = getFieldsForStep(currentStep);
    return form.trigger(currentStepFields as any);
  };
  
  const nextStep = async () => {
    // Validate current step before moving forward
    const isValid = await validateCurrentStep(step);
    
    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const goToStep = async (stepNumber: number) => {
    // If trying to go forward, validate all steps up to the target
    if (stepNumber > step) {
      for (let i = step; i < stepNumber; i++) {
        const isValid = await validateCurrentStep(i);
        if (!isValid) {
          // Stop at the first invalid step
          setStep(i);
          return;
        }
      }
    }
    
    // Either going backward or all previous steps validated successfully
    setStep(stepNumber);
  };

  return {
    step,
    nextStep,
    prevStep,
    goToStep,
  };
}
