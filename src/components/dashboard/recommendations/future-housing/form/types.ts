
import { FutureHousingPlan } from "../types";

export interface FormSectionProps {
  newPlan: Partial<FutureHousingPlan>;
  setNewPlan: (plan: Partial<FutureHousingPlan>) => void;
}

export interface PlanCreationFormProps {
  newPlan: Partial<FutureHousingPlan>;
  setNewPlan: (plan: Partial<FutureHousingPlan>) => void;
  onSave: () => void;
  onCancel: () => void;
}
