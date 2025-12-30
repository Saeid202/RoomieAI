import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepContent } from "./StepContent";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AboutMeStepperProps {
  form: UseFormReturn<ProfileFormValues>;
}

const STEPS = [
  {
    title: "Personal Information",
    fields: ["fullName", "age", "gender"],
  },
  {
    title: "Contact & Privacy",
    fields: ["email", "phoneNumber", "profileVisibility", "linkedinProfile"],
  },
  {
    title: "Background & Identity",
    fields: ["nationality", "language", "ethnicity"],
  },
  {
    title: "Occupation & Lifestyle",
    fields: ["occupation", "workLocation", "workSchedule"],
  },
  {
    title: "Diet & Preferences",
    fields: ["diet", "dietOther", "religion"],
  },
  {
    title: "Housing Preferences",
    fields: ["preferredLocation", "housingType", "livingSpace"],
  },
  {
    title: "Lifestyle Habits",
    fields: ["smoking", "livesWithSmokers", "hasPets"],
  },
  {
    title: "Final Details",
    fields: ["budgetRange", "hobbies"],
  },
  {
    title: "Review",
    fields: [], // No fields for review step
  },
];

export function AboutMeStepper({ form }: AboutMeStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;
  const isReviewStep = currentStep === STEPS.length - 1;
  const isStepBeforeReview = currentStep === STEPS.length - 2;

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{STEPS[currentStep].title}</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step Dots with Tooltip */}
        <TooltipProvider>
          <div className="flex items-center gap-3">
            {STEPS.map((step, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => goToStep(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentStep
                        ? "bg-primary scale-110"
                        : index < currentStep
                          ? "bg-primary/50 hover:bg-primary/70 cursor-pointer"
                          : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
                      }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{step.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* Step Content */}
      <StepContent step={currentStep} form={form} />

      {/* Navigation Buttons - Hide in review step */}

      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {!isReviewStep && (
          <Button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2"
          >
            {isStepBeforeReview ? "Review" : "Next"}
            {!isStepBeforeReview && <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
