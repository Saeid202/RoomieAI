import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, MapPin, DollarSign, Home, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roomTypes = [
  "Private Room",
  "Shared Room", 
  "Master Bedroom",
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3+ Bedroom"
];

const amenities = [
  "WiFi Included",
  "Utilities Included", 
  "Parking Available",
  "Laundry",
  "Kitchen Access",
  "Air Conditioning",
  "Heating",
  "Pet Friendly",
  "Furnished",
  "Private Bathroom"
];

export default function ListRoomPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roomType: "",
    rent: "",
    location: "",
    availableFrom: "",
    leaseTerm: "",
    selectedAmenities: [] as string[],
    photos: [] as File[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.rent || !formData.location || !formData.roomType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving the listing
    toast({
      title: "Room Listed Successfully!",
      description: "Your room listing has been created and is now live"
    });
    
    // Navigate back to home or listings
    navigate("/dashboard/roommate-recommendations");
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: checked 
        ? [...prev.selectedAmenities, amenity]
        : prev.selectedAmenities.filter(a => a !== amenity)
    }));
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List Your Room</h1>
          <p className="text-muted-foreground">Create a listing to find your perfect roommate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>Tell us about your room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Cozy room in downtown apartment"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your room, the apartment, and what you're looking for in a roommate..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Select 
                  value={formData.roomType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rent}
                    onChange={(e) => setFormData(prev => ({ ...prev, rent: e.target.value }))}
                    placeholder="1200"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location & Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Downtown Toronto, ON"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lease Term</Label>
                <Select 
                  value={formData.leaseTerm}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leaseTerm: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month-to-month">Month-to-Month</SelectItem>
                    <SelectItem value="6-months">6 Months</SelectItem>
                    <SelectItem value="12-months">12 Months</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Features</CardTitle>
            <CardDescription>Select what's included with your room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.selectedAmenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <Label htmlFor={amenity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Photos
            </CardTitle>
            <CardDescription>Add photos to attract more potential roommates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Drag & drop photos here, or click to browse</p>
              <Button type="button" variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Create Listing
          </Button>
        </div>
      </form>
    </div>
  );
}