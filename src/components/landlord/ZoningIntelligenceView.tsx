import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Search, ShieldCheck, Zap, Info, ArrowRight, CheckCircle2, AlertCircle, Home } from "lucide-react";
import { zoningService, ZoningRule } from "@/services/zoningService";
import { locationService } from "@/services/locationService";
import { Property } from "@/services/propertyService";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20 p-4 md:p-8">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Zoning Intelligence</h2>
              <p className="text-orange-100 text-lg">Instantly discover what you can legally build on your Toronto property</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Portfolio Intelligence Section */}
        {properties.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Home className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Your Portfolio Analysis</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {properties.map((p) => (
                <Card 
                  key={p.id} 
                  className={`cursor-pointer transition-all hover:shadow-xl border-2 overflow-hidden ${analyzedPropertyId === p.id ? 'border-orange-500 bg-orange-50/30 shadow-orange-100' : 'border-slate-200 hover:border-orange-300'}`}
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
                    className={`w-full text-xs font-bold ${analyzedPropertyId === p.id ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
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
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Search className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Global Search</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-6">
              <Card className="border-2 border-orange-200 shadow-xl bg-white/70 backdrop-blur-md overflow-hidden relative">
                <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">Search Any Toronto Property</h4>
                  </div>
                </div>
              </Card>
              
              {/* Address Input moved outside the backdrop-blur container */}
              <div className="w-full">
                <Input
                  placeholder="e.g., 53 Mandarin Cres"
                  value={address}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAddress(val);
                    setAnalyzedPropertyId(null);
                    if (val.length > 5) {
                      handleAnalyze(val);
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              <Card className="border-2 border-orange-200 shadow-xl bg-white/70 backdrop-blur-md overflow-hidden relative">
                <CardContent className="pt-6 pb-6">
                  <Button 
                    type="button"
                    size="lg" 
                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 transition-all shadow-lg font-bold text-lg text-white"
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
                </CardContent>
              </Card>
            </div>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50 to-purple-50 h-full">
                <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                      <ShieldCheck className="h-12 w-12 text-orange-600 mx-auto" />
                    </div>
                    <h4 className="text-lg font-semibold text-orange-900">Why Choose Our Zoning Intelligence?</h4>
                    <ul className="text-sm text-orange-800 space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                        <span>Instant analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                        <span>Rule-based engine</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                        <span>No login required</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-600" />
                        <span>Free to use</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      {/* Results Display */}
      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 border-t pt-8">
          {/* Left Column: Zoning Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-600 to-purple-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Building className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-4xl font-black">{result.zone_code}</CardTitle>
                <CardDescription className="text-orange-100 text-lg font-medium">
                  {result.zone_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold tracking-wider text-orange-200 mb-1">Max Height</p>
                    <p className="text-lg font-semibold">{result.max_height || "Consult By-law"}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs uppercase font-bold tracking-wider text-orange-200 mb-1">Density Potential</p>
                    <p className={`text-lg font-bold ${result.densification_potential === 'High' ? 'text-green-300' : 'text-yellow-300'}`}>
                      {result.densification_potential}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 bg-orange-50/30">
              <CardContent className="p-4 flex gap-3 text-sm text-orange-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  <strong>Disclaimer:</strong> This is an estimate based on standard rules. Always verify with a planner before starting construction.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Allowed Uses & Insight */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b bg-orange-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                    What You Can Build
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {result.allowed_uses.map((use, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50/50">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-700">{use}</span>
                    </div>
                  ))}
                  {result.conditional_uses.map((use, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/50">
                      <Info className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-600">{use} <span className="text-[10px] bg-orange-100 px-1 rounded uppercase">Conditional</span></span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-purple-50 border border-orange-100 relative overflow-hidden">
                   <div className="flex items-start gap-4 z-10 relative">
                     <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg">
                        <Zap className="h-6 w-6" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="font-bold text-orange-900">Homie AI Insight</h4>
                        <p className="text-orange-800 leading-relaxed italic">
                          "{result.insight}"
                        </p>
                     </div>
                   </div>
                </div>

                <div className="mt-6 flex justify-end">
                   <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
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
    </div>
  );
};

export default ZoningIntelligenceView;
