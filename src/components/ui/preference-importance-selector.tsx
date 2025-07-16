import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PreferenceImportance = "notImportant" | "important" | "must";

interface PreferenceImportanceSelectorProps {
  value?: PreferenceImportance;
  onValueChange: (value: PreferenceImportance) => void;
  className?: string;
}

export function PreferenceImportanceSelector({ 
  value = "notImportant", 
  onValueChange, 
  className 
}: PreferenceImportanceSelectorProps) {
  const options = [
    { value: "notImportant" as const, label: "Not Important", color: "text-gray-500" },
    { value: "important" as const, label: "Important", color: "text-blue-600" },
    { value: "must" as const, label: "Must Have", color: "text-red-600" },
  ];

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-32 h-8 text-xs ${className}`}>
        <SelectValue>
          <span className={selectedOption.color}>
            {selectedOption.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            <span className={option.color}>
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 