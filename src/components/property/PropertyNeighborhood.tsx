
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface PropertyNeighborhoodProps {
  formData: {
    neighborhood?: string;
    schoolDistrict?: string;
    nearbyAmenities?: string[];
    neighborhoodDescription?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (name: string, value: string, checked: boolean) => void;
}

const NEARBY_AMENITIES = [
  "Shopping Center", "Public Park", "Elementary School", "Middle School",
  "High School", "University", "Hospital", "Medical Center", "Grocery Store",
  "Restaurant", "Public Transportation", "Highway Access", "Airport", "Beach"
];

export function PropertyNeighborhood({ 
  formData, 
  handleChange, 
  handleCheckboxChange 
}: PropertyNeighborhoodProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Neighborhood Information</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="neighborhood">Neighborhood Name</Label>
          <Input 
            id="neighborhood" 
            name="neighborhood" 
            placeholder="Name of the neighborhood"
            value={formData.neighborhood || ''}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="schoolDistrict">School District</Label>
          <Input 
            id="schoolDistrict" 
            name="schoolDistrict" 
            placeholder="School district name"
            value={formData.schoolDistrict || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="neighborhoodDescription">Neighborhood Description</Label>
        <Textarea 
          id="neighborhoodDescription" 
          name="neighborhoodDescription" 
          placeholder="Describe the neighborhood and its highlights..."
          value={formData.neighborhoodDescription || ''}
          onChange={handleChange}
          rows={3}
        />
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Nearby Amenities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {NEARBY_AMENITIES.map((amenity) => (
            <div className="flex items-center space-x-2" key={amenity}>
              <Checkbox 
                id={`nearby-${amenity}`} 
                checked={(formData.nearbyAmenities || []).includes(amenity)}
                onCheckedChange={(checked) => 
                  handleCheckboxChange("nearbyAmenities", amenity, checked as boolean)
                }
              />
              <Label 
                htmlFor={`nearby-${amenity}`}
                className="cursor-pointer"
              >
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
