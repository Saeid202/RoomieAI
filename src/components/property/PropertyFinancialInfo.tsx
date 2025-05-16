
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyFinancialInfoProps {
  formData: {
    basePrice?: string;
    pricePerSqFt?: string;
    hoaFees?: string;
    propertyTaxRate?: string;
    financingOptions?: string[];
    downPaymentMin?: string;
    closingCostEstimate?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, value: string, checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const FINANCING_OPTIONS = [
  "Conventional Loan", "FHA Loan", "VA Loan", "USDA Loan", 
  "Jumbo Loan", "Down Payment Assistance", "Builder Financing",
  "Rent-to-Own", "Seller Financing", "Cash"
];

export function PropertyFinancialInfo({ 
  formData, 
  handleChange, 
  handleCheckboxChange 
}: PropertyFinancialInfoProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Financial Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="basePrice">Base Price ($)</Label>
          <Input 
            id="basePrice" 
            name="basePrice" 
            type="number"
            placeholder="Starting price"
            value={formData.basePrice || ''}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="pricePerSqFt">Price per sq ft ($)</Label>
          <Input 
            id="pricePerSqFt" 
            name="pricePerSqFt" 
            type="number"
            placeholder="$ per square foot"
            value={formData.pricePerSqFt || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="hoaFees">HOA Fees ($/month)</Label>
          <Input 
            id="hoaFees" 
            name="hoaFees" 
            type="number"
            placeholder="Monthly HOA fees"
            value={formData.hoaFees || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="propertyTaxRate">Property Tax Rate (%)</Label>
          <Input 
            id="propertyTaxRate" 
            name="propertyTaxRate" 
            type="number"
            step="0.01"
            placeholder="Annual tax rate"
            value={formData.propertyTaxRate || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="downPaymentMin">Minimum Down Payment (%)</Label>
          <Input 
            id="downPaymentMin" 
            name="downPaymentMin" 
            type="number"
            placeholder="Minimum percentage"
            value={formData.downPaymentMin || ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="closingCostEstimate">Est. Closing Costs ($)</Label>
          <Input 
            id="closingCostEstimate" 
            name="closingCostEstimate" 
            type="number"
            placeholder="Estimated costs"
            value={formData.closingCostEstimate || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Available Financing Options</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FINANCING_OPTIONS.map((option) => (
            <div className="flex items-center space-x-2" key={option}>
              <Checkbox 
                id={`financing-${option}`} 
                checked={(formData.financingOptions || []).includes(option)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("financingOptions", option, checked as boolean)
                }
              />
              <Label 
                htmlFor={`financing-${option}`}
                className="cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
