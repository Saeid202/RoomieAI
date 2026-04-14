import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Search, ShieldCheck, Zap, Info, ArrowRight, CheckCircle2, AlertCircle, Home } from "lucide-react";
import { zoningService, ZoningRule } from "@/services/zoningService";
import { locationService } from "@/services/locationService";
import { Property } from "@/services/propertyService";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import { AddressSuggestion } from "@/types/address";

interface ZoningIntelligenceViewProps {
  properties?: Property[];
}

const ZoningIntelligenceView: React.FC<ZoningIntelligenceViewProps> = ({ properties = [] }) => {
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ZoningRule | null>(null);
  const [analyzedPropertyId, setAnalyzedPropertyId] = useState<string | null>(null);

  const handleAnalyze = async (searchAddress?: string, propertyId?: string) => {
    const targetAddress = searchAddress || address;
    
    if (!targetAddress || !targetAddress.trim()) {
      toast.error("Please enter a property address");
      return;
    }

    setIsSearching(true);
    setResult(null);
    setAnalyzedPropertyId(propertyId || null);

    try {
      // 1. Logic-based free search
      const suggestions = await locationService.searchAddress(targetAddress);

      if (suggestions.length === 0) {
        toast.error("Address not found. Please try a more specific Toronto address.");
        setIsSearching(false);
        return;
      }

      const suggestion = suggestions[0];
      const details = await locationService.getAddressDetails(suggestion);
      
      if (details.coordinates) {
        // 2. Local Rules Engine lookup
        const zoning = await zoningService.getZoningForCoordinates(
          details.coordinates.lat,
          details.coordinates.lng
        );
        
        if (zoning) {
          setResult(zoning);
          toast.success("Analysis complete!");
        } else {
          toast.info("Showing typical residential patterns for this specific area.");
          setResult(zoningService.getZoningByCode("RD"));
        }
      } else {
        toast.error("Could not find exact coordinates for this address.");
      }
    } catch (error) {
      console.error("❌ Analysis error:", error);
      toast.error("An error occurred during analysis.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Zoning Intelligence
        </h2>
        <p className="text-muted-foreground text-lg">
          Instantly discover what you can legally build on your Toronto property.
        </p>
      </div>

      {/* Portfolio Intelligence Section */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-xl text-gray-800">Your Portfolio Analysis</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <Card 
                key={p.id} 
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${analyzedPropertyId === p.id ? 'border-blue-500 bg-blue-50/30 shadow-blue-100' : 'border-gray-100'}`}
                onClick={() => {
                  setAddress(p.address);
                  handleAnalyze(p.address, p.id);
                }}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 line-clamp-1">{p.listing_title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {p.address}, {p.city}
                    </p>
                  </div>
                  <Button 
                    variant={analyzedPropertyId === p.id ? "default" : "outline"} 
                    size="sm" 
                    className={`w-full text-xs font-bold ${analyzedPropertyId === p.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  >
                    {isSearching && analyzedPropertyId === p.id ? "Analyzing..." : "Analyze Zoning"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Global Search Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Search className="h-5 w-5 text-blue-600" />
          <h3 className="font-bold text-xl text-gray-800">Global Search</h3>
        </div>
        <Card className="border-2 border-blue-100 shadow-xl bg-white/50 backdrop-blur-md overflow-visible relative">
          <CardContent className="pt-6 overflow-visible space-y-4">
            <div className="w-full">
              <AddressAutocomplete
                onAddressSelect={(suggestion: AddressSuggestion) => {
                  setAddress(suggestion.text);
                  handleAnalyze(suggestion.text);
                }}
                onInputChange={(val) => {
                  setAddress(val);
                  setAnalyzedPropertyId(null);
                }}
                value={address}
                label="Property Address (Toronto Only)"
                placeholder="e.g., 53 Mandarin Cres"
              />
            </div>
            
            <Button 
              type="button"
              size="lg" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all shadow-lg font-bold text-lg"
              onClick={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              disabled={isSearching}
            >
              {isSearching && !analyzedPropertyId ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing Property Potential...
                </span>
              ) : (
                <>
                  <Search className="mr-2 h-6 w-6" />
                  Analyze Zoning Potential
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Rule-based engine. No login or payment required.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {result ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t pt-8">
          {/* Left Column: Zoning Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Building className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-4xl font-black">{result.zone_code}</CardTitle>
                <CardDescription className="text-blue-100 text-lg font-medium">
                  {result.zone_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold tracking-wider text-blue-200 mb-1">Max Height</p>
                    <p className="text-lg font-semibold">{result.max_height || "Consult By-law"}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold tracking-wider text-blue-200 mb-1">Density Potential</p>
                    <p className={`text-lg font-bold ${result.densification_potential === 'High' ? 'text-green-300' : 'text-yellow-300'}`}>
                      {result.densification_potential}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-100 bg-yellow-50/30">
              <CardContent className="p-4 flex gap-3 text-sm text-yellow-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  <strong>Disclaimer:</strong> This is an estimate based on standard rules. Always verify with a planner before starting construction.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Allowed Uses & Insight */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    What You Can Build
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.allowed_uses.map((use, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50/50">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-700">{use}</span>
                    </div>
                  ))}
                  {result.conditional_uses.map((use, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                      <Info className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-600">{use} <span className="text-[10px] bg-blue-100 px-1 rounded uppercase">Conditional</span></span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 relative overflow-hidden">
                   <div className="flex items-start gap-4 z-10 relative">
                     <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                        <Zap className="h-6 w-6" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-indigo-900">Homie AI Insight</h4>
                        <p className="text-indigo-800 leading-relaxed italic">
                          "{result.insight}"
                        </p>
                     </div>
                   </div>
                </div>

                <div className="mt-6 flex justify-end">
                   <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                     Maximize This Property <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : !isSearching && (
        <div className="py-20 text-center space-y-4 opacity-50">
           <Building className="h-16 w-16 mx-auto text-muted-foreground" />
           <p className="text-lg">Select a property above or search an address to reveal insights.</p>
        </div>
      )}
    </div>
  );
};

export default ZoningIntelligenceView;
