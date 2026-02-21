// =====================================================
// Suggested Questions Component
// =====================================================
// Purpose: Pre-populated common questions for buyers
// =====================================================

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  DollarSign, 
  Wrench, 
  FileText,
  PawPrint,
  Calendar,
  Zap,
  Shield
} from "lucide-react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  propertyCategory?: string;
}

const COMMON_QUESTIONS = [
  {
    category: "Legal & Ownership",
    icon: Shield,
    color: "indigo",
    questions: [
      "What are the annual property taxes?",
      "Are there any liens or encumbrances on the property?",
      "What's included in the sale?",
      "When was the title last transferred?",
    ],
  },
  {
    category: "Fees & Costs",
    icon: DollarSign,
    color: "green",
    questions: [
      "What are the monthly condo fees?",
      "What do the condo fees cover?",
      "Have the fees increased recently?",
      "Are there any special assessments planned?",
    ],
  },
  {
    category: "Rules & Restrictions",
    icon: FileText,
    color: "purple",
    questions: [
      "Are pets allowed?",
      "What are the pet restrictions?",
      "Can I rent out the unit?",
      "Are there any rental restrictions?",
      "What are the noise bylaws?",
    ],
  },
  {
    category: "Maintenance & Repairs",
    icon: Wrench,
    color: "orange",
    questions: [
      "When was the roof last replaced?",
      "What major repairs have been done?",
      "Are there any known issues?",
      "What's the condition of the HVAC system?",
      "When was the building last inspected?",
    ],
  },
  {
    category: "Building & Amenities",
    icon: Home,
    color: "blue",
    questions: [
      "What amenities are available?",
      "How many units are in the building?",
      "Is there visitor parking?",
      "What's the reserve fund balance?",
      "Are there any upcoming renovations?",
    ],
  },
  {
    category: "Utilities & Services",
    icon: Zap,
    color: "yellow",
    questions: [
      "What utilities are included?",
      "What are the average utility costs?",
      "Is there central air conditioning?",
      "What internet providers are available?",
    ],
  },
];

const CONDO_SPECIFIC = [
  "What's the status of the reserve fund?",
  "Are there any pending lawsuits against the condo corporation?",
  "What percentage of units are owner-occupied vs rented?",
  "What are the insurance requirements?",
];

const HOUSE_SPECIFIC = [
  "What's the lot size?",
  "Are there any easements on the property?",
  "What's the zoning classification?",
  "Is the property connected to municipal services?",
];

export function SuggestedQuestions({
  onSelectQuestion,
  propertyCategory,
}: SuggestedQuestionsProps) {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
      blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    };
    return colors[color] || colors.indigo;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PawPrint className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Suggested Questions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMMON_QUESTIONS.map((category) => {
          const Icon = category.icon;
          const colors = getColorClasses(category.color);

          return (
            <Card key={category.category} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{category.category}</h4>
              </div>

              <div className="space-y-2">
                {category.questions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectQuestion(question)}
                    className="w-full justify-start text-left h-auto py-2 px-3 text-xs hover:bg-slate-50"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Property-Specific Questions */}
      {propertyCategory && (
        <Card className="p-4 space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">
              {propertyCategory}-Specific Questions
            </h4>
          </div>

          <div className="space-y-2">
            {(propertyCategory === "Condo" ? CONDO_SPECIFIC : HOUSE_SPECIFIC).map(
              (question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectQuestion(question)}
                  className="w-full justify-start text-left h-auto py-2 px-3 text-xs hover:bg-indigo-100 border-indigo-200"
                >
                  {question}
                </Button>
              )
            )}
          </div>
        </Card>
      )}

      <p className="text-xs text-slate-500 text-center">
        Click any question to ask the AI assistant, or type your own question.
      </p>
    </div>
  );
}
