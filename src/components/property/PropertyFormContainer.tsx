
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyFormActions } from "./PropertyFormActions";
import { createProperty } from "@/services/propertyService";
import { toast } from "@/components/ui/use-toast";
import { PropertyFormPreview } from "./PropertyFormPreview";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { PropertyFormTabs } from "./PropertyFormTabs";

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
