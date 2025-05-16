
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface PropertyDevelopmentFeaturesProps {
  formData: {
    developmentName?: string;
    totalUnits?: string;
    communityAmenities?: string[];
    constructionMaterials?: string;
    energyEfficiencyFeatures?: string[];
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const COMMUNITY_AMENITIES = [
  "Swimming Pool", "Fitness Center", "Clubhouse", "Tennis Courts", 
  "Basketball Courts", "Playground", "Dog Park", "Walking Trails",
  "Security Gate", "Community Garden", "BBQ Areas", "Event Space"
];

const ENERGY_EFFICIENCY = [
  "Solar Panels", "Energy Star Appliances", "LEED Certification", 
  "Smart Home Features", "High Efficiency HVAC", "Double-pane Windows",
  "Extra Insulation", "EV Charging Station", "Energy Efficient Lighting"
];

export function PropertyDevelopmentFeatures({ 
  formData, 
  handleChange, 
  handleCheckboxChange 
}: PropertyDevelopmentFeaturesProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Development Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="developmentName">Development/Community Name</Label>
          <Input 
            id="developmentName" 
            name="developmentName" 
            placeholder="Name of the development"
            value={formData.developmentName || ''}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="totalUnits">Total Units in Development</Label>
          <Input 
            id="totalUnits" 
            name="totalUnits" 
            type="number"
            placeholder="Number of units"
            value={formData.totalUnits || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="constructionMaterials">Construction Materials</Label>
        <Textarea 
          id="constructionMaterials" 
          name="constructionMaterials" 
          placeholder="Describe the primary materials used in construction..."
          value={formData.constructionMaterials || ''}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Community Amenities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMUNITY_AMENITIES.map((amenity) => (
            <div className="flex items-center space-x-2" key={amenity}>
              <Checkbox 
                id={`amenity-${amenity}`} 
                checked={(formData.communityAmenities || []).includes(amenity)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("communityAmenities", amenity, checked as boolean)
                }
              />
              <Label 
                htmlFor={`amenity-${amenity}`}
                className="cursor-pointer"
              >
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Energy Efficiency Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ENERGY_EFFICIENCY.map((feature) => (
            <div className="flex items-center space-x-2" key={feature}>
              <Checkbox 
                id={`energy-${feature}`} 
                checked={(formData.energyEfficiencyFeatures || []).includes(feature)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("energyEfficiencyFeatures", feature, checked as boolean)
                }
              />
              <Label 
                htmlFor={`energy-${feature}`}
                className="cursor-pointer"
              >
                {feature}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
