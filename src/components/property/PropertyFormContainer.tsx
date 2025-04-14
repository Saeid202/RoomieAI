
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyFormInputs } from "./PropertyFormInputs";
import { PropertyFormActions } from "./PropertyFormActions";
import { createProperty } from "@/services/propertyService";
import { toast } from "@/components/ui/use-toast";
import { PropertyFormPreview } from "./PropertyFormPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyDetails } from "./PropertyDetails";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyMedia } from "./PropertyMedia";
import { PropertyAvailability } from "./PropertyAvailability";
import { usePropertyForm, PropertyFormState } from "@/hooks/usePropertyForm";

export default function PropertyFormContainer() {
  const navigate = useNavigate();
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    activeTab,
    showPreview,
    fileInputRef,
    handleChange,
    handleSelectChange,
    handleCheckboxChange,
    handleImageUpload,
    removeImage,
    handleTabChange,
    togglePreview,
    setShowPreview
  } = usePropertyForm();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert strings to numbers for numeric fields
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        squareFeet: formData.squareFeet ? parseFloat(formData.squareFeet) : undefined,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
        lotSize: formData.lotSize ? parseFloat(formData.lotSize) : undefined,
      };
      
      await createProperty(propertyData);
      toast({
        title: "Property created",
        description: "Your property has been successfully listed.",
      });
      navigate("/dashboard/properties");
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPreview) {
    return (
      <PropertyFormPreview 
        formData={formData} 
        onBack={() => setShowPreview(false)} 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
        <CardDescription>Fill in the information about your property</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PropertyFormTabs 
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            formData={formData}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handleCheckboxChange={handleCheckboxChange}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />
          
          <PropertyFormActions 
            navigate={navigate} 
            isSubmitting={isSubmitting}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onPreview={togglePreview}
            isLastTab={activeTab === "media"}
          />
        </form>
      </CardContent>
    </Card>
  );
}

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

function PropertyFormTabs({
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
