
import { useState, useRef } from "react";
import { PropertyType, uploadPropertyImage } from "@/services/propertyService";
import { toast } from "@/components/ui/use-toast";

export interface PropertyFormState {
  title: string;
  description: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: PropertyType;
  imageUrls: string[];
  squareFeet: string;
  yearBuilt: string;
  amenities: string[];
  petPolicy: string;
  utilities: string[];
  furnishedStatus: string;
  availability: string;
  virtualTourUrl: string;
  parkingType: string;
  lotSize: string;
}

const initialFormState: PropertyFormState = {
  title: "",
  description: "",
  address: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  propertyType: "rent" as PropertyType,
  imageUrls: [],
  squareFeet: "",
  yearBuilt: "",
  amenities: [],
  petPolicy: "",
  utilities: [],
  furnishedStatus: "",
  availability: "",
  virtualTourUrl: "",
  parkingType: "",
  lotSize: ""
};

export function usePropertyForm() {
  const [formData, setFormData] = useState<PropertyFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return {
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
  };
}
