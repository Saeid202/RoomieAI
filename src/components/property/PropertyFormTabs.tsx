
import { PropertyFormState } from "@/hooks/usePropertyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyFormInputs } from "./PropertyFormInputs";
import { PropertyDetails } from "./PropertyDetails";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyMedia } from "./PropertyMedia";

interface PropertyFormTabsProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  formData: PropertyFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, value: string, checked: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export function PropertyFormTabs({
  activeTab,
  handleTabChange,
  formData,
  handleChange,
  handleSelectChange,
  handleCheckboxChange,
  fileInputRef,
  handleImageUpload,
  removeImage
}: PropertyFormTabsProps) {
  return (
    <Tabs defaultValue="basic" value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="details">Property Details</TabsTrigger>
        <TabsTrigger value="amenities">Amenities</TabsTrigger>
        <TabsTrigger value="media">Photos & Media</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6">
        <PropertyFormInputs 
          formData={formData} 
          handleChange={handleChange} 
          handleSelectChange={handleSelectChange} 
        />
      </TabsContent>
      
      <TabsContent value="details" className="space-y-6">
        <PropertyDetails
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="amenities" className="space-y-6">
        <PropertyAmenities
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
          handleSelectChange={handleSelectChange}
        />
      </TabsContent>
      
      <TabsContent value="media" className="space-y-6">
        <PropertyMedia
          formData={formData}
          handleChange={handleChange}
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
        />
      </TabsContent>
    </Tabs>
  );
}
