
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyFormInputs } from "./PropertyFormInputs";
import { PropertyFormActions } from "./PropertyFormActions";
import { createProperty, PropertyType } from "@/services/propertyService";
import { toast } from "@/components/ui/use-toast";

export default function PropertyForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "rent" as PropertyType,
    imageUrls: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
        <CardDescription>Fill in the information about your property</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PropertyFormInputs 
            formData={formData} 
            handleChange={handleChange} 
            handleSelectChange={handleSelectChange} 
          />
          
          <PropertyFormActions 
            navigate={navigate} 
            isSubmitting={isSubmitting} 
          />
        </form>
      </CardContent>
    </Card>
  );
}
