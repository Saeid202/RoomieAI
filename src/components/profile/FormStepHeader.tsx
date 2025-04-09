
import { CardTitle, CardDescription } from "@/components/ui/card";

interface FormStepHeaderProps {
  step: number;
  totalSteps: number;
}

export function FormStepHeader({ step, totalSteps }: FormStepHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1 rounded-full ${
                i + 1 <= step ? "bg-roomie-purple" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
      </div>
      <CardTitle className="text-xl font-bold">
        {step === 1 && "Basic Information"}
        {step === 2 && "Housing Preferences"}
        {step === 3 && "Lifestyle & Habits"}
        {step === 4 && "Work & Sleep Schedule"}
        {step === 5 && "Cleanliness & Organization"}
        {step === 6 && "Social Preferences"}
        {step === 7 && "Cooking & Meals"}
        {step === 8 && "Lease Terms"}
      </CardTitle>
      <CardDescription>
        {step === 1 && "Tell us about yourself"}
        {step === 2 && "What kind of housing are you looking for?"}
        {step === 3 && "Let us know about your lifestyle"}
        {step === 4 && "Share your daily schedule"}
        {step === 5 && "How do you like to keep your living space?"}
        {step === 6 && "Tell us about your social preferences"}
        {step === 7 && "Share your cooking and meal preferences"}
        {step === 8 && "What are your lease term preferences?"}
      </CardDescription>
    </>
  );
}
