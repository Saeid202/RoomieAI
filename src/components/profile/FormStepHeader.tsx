
import React from 'react';
import { cn } from "@/lib/utils";

interface FormStepHeaderProps {
  step: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export function FormStepHeader({
  step,
  totalSteps,
  onStepClick,
}: FormStepHeaderProps) {
  const stepTitles = [
    "Personal Info",
    "Housing",
    "Lifestyle",
    "Social & Cleaning",
    "Roommate Preferences",
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center">Complete Your Profile</h2>
      
      <div className="flex justify-between items-center mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;
          
          const stepCircle = (
            <div
              key={stepNumber}
              className="flex flex-col items-center flex-1"
              onClick={() => isCompleted && onStepClick(stepNumber)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 cursor-pointer transition-colors",
                  isActive
                    ? "bg-primary"
                    : isCompleted
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-300"
                )}
              >
                {stepNumber}
              </div>
              <span className="text-xs text-center hidden md:block">
                {stepTitles[index]}
              </span>
            </div>
          );
          
          // Add connecting line between steps if not the last step
          if (index < totalSteps - 1) {
            return (
              <React.Fragment key={stepNumber}>
                {stepCircle}
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    isCompleted
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
              </React.Fragment>
            );
          }
          
          // Return just the step for the last item
          return stepCircle;
        })}
      </div>
    </div>
  );
}
