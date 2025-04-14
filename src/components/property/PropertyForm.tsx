
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyFormInputs } from "./PropertyFormInputs";
import { PropertyFormActions } from "./PropertyFormActions";
import { createProperty, PropertyType, uploadPropertyImage } from "@/services/propertyService";
import { toast } from "@/components/ui/use-toast";
import { PropertyFormPreview } from "./PropertyFormPreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyDetails } from "./PropertyDetails";
import { PropertyAmenities } from "./PropertyAmenities";
import { PropertyMedia } from "./PropertyMedia";
import { PropertyAvailability } from "./PropertyAvailability";

export default function PropertyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "rent" as PropertyType,
    imageUrls: [] as string[],
    squareFeet: "",
    yearBuilt: "",
    amenities: [] as string[],
    petPolicy: "",
    utilities: [] as string[],
    furnishedStatus: "",
    availability: "",
    virtualTourUrl: "",
    parkingType: "",
    lotSize: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    if (name === 'amenities' || name === 'utilities') {
      const currentValues = [...formData[name as 'amenities' | 'utilities']];
      
      if (checked) {
        currentValues.push(value);
      } else {
        const index = currentValues.indexOf(value);
        if (index !== -1) {
          currentValues.splice(index, 1);
        }
      }
      
      setFormData(prev => ({ ...prev, [name]: currentValues }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadPropertyImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, imageUrl]
      }));
      
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded."
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
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
