
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
import { PropertyDevelopmentFeatures } from "./PropertyDevelopmentFeatures";
import { PropertyNeighborhood } from "./PropertyNeighborhood";
import { PropertyFinancialInfo } from "./PropertyFinancialInfo";

interface PropertyFormProps {
  propertyType?: PropertyType;
}

export default function PropertyForm({ propertyType = "rent" }: PropertyFormProps) {
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
    propertyType: propertyType,
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
    lotSize: "",
    // New developer-specific fields
    propertyStatus: "",
    developerName: "",
    developmentName: "",
    totalUnits: "",
    communityAmenities: [] as string[],
    constructionMaterials: "",
    energyEfficiencyFeatures: [] as string[],
    neighborhood: "",
    schoolDistrict: "",
    nearbyAmenities: [] as string[],
    neighborhoodDescription: "",
    basePrice: "",
    pricePerSqFt: "",
    hoaFees: "",
    propertyTaxRate: "",
    financingOptions: [] as string[],
    downPaymentMin: "",
    closingCostEstimate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    if (name === 'amenities' || name === 'utilities' || name === 'communityAmenities' || 
        name === 'energyEfficiencyFeatures' || name === 'nearbyAmenities' || name === 'financingOptions') {
      const currentValues = [...(formData[name as keyof typeof formData] as string[] || [])];
      
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
        // Convert other numeric fields
        totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined,
        pricePerSqFt: formData.pricePerSqFt ? parseFloat(formData.pricePerSqFt) : undefined,
        hoaFees: formData.hoaFees ? parseFloat(formData.hoaFees) : undefined,
        propertyTaxRate: formData.propertyTaxRate ? parseFloat(formData.propertyTaxRate) : undefined,
        downPaymentMin: formData.downPaymentMin ? parseFloat(formData.downPaymentMin) : undefined,
        closingCostEstimate: formData.closingCostEstimate ? parseFloat(formData.closingCostEstimate) : undefined,
      };
      
      await createProperty(propertyData);
      toast({
        title: "Property created",
        description: "Your property has been successfully listed.",
      });
      
      // Redirect to the appropriate dashboard based on property type
      if (propertyType === 'sale') {
        navigate("/dashboard/developer/properties");
      } else {
        navigate("/dashboard/landlord/properties");
      }
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

  // Determine which tabs to show based on property type
  const getTabs = () => {
    const baseTabs = [
      { id: "basic", label: "Basic Info" },
      { id: "details", label: "Property Details" },
      { id: "amenities", label: "Amenities" },
      { id: "media", label: "Photos & Media" }
    ];

    // Add developer-specific tabs for sale properties
    if (formData.propertyType === 'sale') {
      return [
        ...baseTabs,
        { id: "development", label: "Development Info" },
        { id: "neighborhood", label: "Neighborhood" },
        { id: "financial", label: "Financial Info" }
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

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
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-6">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))}
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

            {formData.propertyType === 'sale' && (
              <>
                <TabsContent value="development" className="space-y-6">
                  <PropertyDevelopmentFeatures
                    formData={formData}
                    handleChange={handleChange}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                </TabsContent>
                
                <TabsContent value="neighborhood" className="space-y-6">
                  <PropertyNeighborhood
                    formData={formData}
                    handleChange={handleChange}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-6">
                  <PropertyFinancialInfo
                    formData={formData}
                    handleChange={handleChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleSelectChange={handleSelectChange}
                  />
                </TabsContent>
              </>
            )}
            
          </Tabs>
          
          <PropertyFormActions 
            navigate={navigate} 
            isSubmitting={isSubmitting}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onPreview={togglePreview}
            isLastTab={activeTab === (formData.propertyType === 'sale' ? "financial" : "media")}
          />
        </form>
      </CardContent>
    </Card>
  );
}
