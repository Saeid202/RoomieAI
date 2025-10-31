import {
  PersonalInformationStep,
  ContactPrivacyStep,
  BackgroundIdentityStep,
  OccupationLifestyleStep,
  DietPreferencesStep,
  HousingPreferencesStep,
  LifestyleHabitsStep,
  FinalDetailsStep,
  ReviewStep,
} from "./steps";

interface StepContentProps {
  step: number;
}

export function StepContent({ step }: StepContentProps) {
  switch (step) {
    case 0:
      return <PersonalInformationStep />;
    case 1:
      return <ContactPrivacyStep />;
    case 2:
      return <BackgroundIdentityStep />;
    case 3:
      return <OccupationLifestyleStep />;
    case 4:
      return <DietPreferencesStep />;
    case 5:
      return <HousingPreferencesStep />;
    case 6:
      return <LifestyleHabitsStep />;
    case 7:
      return <FinalDetailsStep />;
    case 8:
      return <ReviewStep />;
    default:
      return null;
  }
}
