import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Home, Building, MapPin, Users } from "lucide-react";

export default function FindPropertyPage() {
  const [searchType, setSearchType] = useState("rental");
  const [priceRange, setPriceRange] = useState([500, 3000]);
  const [location, setLocation] = useState("");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setPropertyTypes([...propertyTypes, type]);
    } else {
      setPropertyTypes(propertyTypes.filter(item => item !== type));
    }
  };

  const handleSearch = () => {
    console.log("Search with:", {
      type: searchType,
      priceRange,
      location,
      propertyTypes
    });
    // In a real app, this would trigger a search
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Property</h1>
          <p className="text-muted-foreground mt-1">
            Search for properties to rent, buy, or co-own
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Property Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rental" value={searchType} onValueChange={setSearchType} className="w-full mb-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="rental" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                Rentals
              </TabsTrigger>
              <TabsTrigger value="purchase" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                For Sale
              </TabsTrigger>
              <TabsTrigger value="co-ownership" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Co-ownership
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="location" className="mb-2 block">Location</Label>
                  <div className="flex">
                    <div className="relative w-full">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10"
                        placeholder="Enter city, neighborhood, or address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="mb-2 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Label>
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />
              </div>

              <div className="space-y-3">
                <Label className="mb-2 block">Property Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apartment" 
                      checked={propertyTypes.includes("apartment")}
                      onCheckedChange={(checked) => 
                        handlePropertyTypeChange("apartment", checked as boolean)
                      }
                    />
                    <Label htmlFor="apartment">Apartment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="house" 
                      checked={propertyTypes.includes("house")}
                      onCheckedChange={(checked) => 
                        handlePropertyTypeChange("house", checked as boolean)
                      }
                    />
                    <Label htmlFor="house">House</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="condo" 
                      checked={propertyTypes.includes("condo")}
                      onCheckedChange={(checked) => 
                        handlePropertyTypeChange("condo", checked as boolean)
                      }
                    />
                    <Label htmlFor="condo">Condo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="townhouse" 
                      checked={propertyTypes.includes("townhouse")}
                      onCheckedChange={(checked) => 
                        handlePropertyTypeChange("townhouse", checked as boolean)
                      }
                    />
                    <Label htmlFor="townhouse">Townhouse</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bedrooms" className="mb-2 block">Bedrooms</Label>
                <Select defaultValue="any">
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bathrooms" className="mb-2 block">Bathrooms</Label>
                <Select defaultValue="any">
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSearch} 
                className="w-full flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Properties
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No search results yet</h3>
              <p className="text-muted-foreground">
                Use the search filters above to find properties that match your criteria
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
