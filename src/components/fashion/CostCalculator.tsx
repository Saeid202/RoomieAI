import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calculator, 
  MapPin, 
  Clock, 
  DollarSign, 
  Truck, 
  Factory,
  Star,
  Info
} from "lucide-react";
import { FashionPlatformService, CostEstimate, ManufacturingPartner } from '@/services/fashionPlatformService';
import { toast } from 'sonner';

interface CostCalculatorProps {
  templateId?: string;
  fabricSelections?: any;
  measurements?: any;
  onCostCalculated?: (estimate: CostEstimate) => void;
}

export default function CostCalculator({ 
  templateId, 
  fabricSelections, 
  measurements, 
  onCostCalculated 
}: CostCalculatorProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isRushOrder, setIsRushOrder] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [manufacturingPartners, setManufacturingPartners] = useState<ManufacturingPartner[]>([]);

  const locations = [
    { id: 'china', name: 'China', flag: '🇨🇳', description: 'Fastest & Most Cost-Effective' },
    { id: 'india', name: 'India', flag: '🇮🇳', description: 'Premium Quality & Craftsmanship' },
    { id: 'vietnam', name: 'Vietnam', flag: '🇻🇳', description: 'Good Balance of Cost & Quality' },
    { id: 'bangladesh', name: 'Bangladesh', flag: '🇧🇩', description: 'Budget-Friendly Option' }
  ];

  useEffect(() => {
    loadManufacturingPartners();
  }, []);

  const loadManufacturingPartners = async () => {
    try {
      const partners = await FashionPlatformService.getManufacturingPartners();
      setManufacturingPartners(partners);
    } catch (error) {
      console.error('Error loading manufacturing partners:', error);
      toast.error('Failed to load manufacturing partners');
    }
  };

  const calculateCost = async () => {
    if (!templateId || !selectedLocation) {
      toast.error('Please select a template and manufacturing location');
      return;
    }

    try {
      setIsCalculating(true);
      const estimate = await FashionPlatformService.calculateCost(
        templateId,
        fabricSelections || {},
        measurements || {},
        selectedLocation,
        isRushOrder
      );
      
      setCostEstimate(estimate);
      onCostCalculated?.(estimate);
      toast.success('Cost calculated successfully!');
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast.error('Failed to calculate cost');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getLocationPartner = (location: string) => {
    return manufacturingPartners.find(partner => partner.location === location);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Cost Calculator
          </h2>
          <p className="text-muted-foreground">Calculate the cost of your custom design</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manufacturing Options
            </CardTitle>
            <CardDescription>
              Choose your manufacturing location and options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Manufacturing Location</label>
              <div className="grid grid-cols-2 gap-3">
                {locations.map((location) => {
                  const partner = getLocationPartner(location.id);
                  return (
                    <div
                      key={location.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedLocation === location.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLocation(location.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{location.flag}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{location.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {location.description}
                          </div>
                          {partner && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {partner.quality_rating}/5 • {partner.lead_time_days} days
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {partner && (
                            <div className="text-sm font-medium">
                              {formatCurrency(partner.cost_per_item)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rush Order Option */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rush-order" 
                checked={isRushOrder}
                onCheckedChange={setIsRushOrder}
              />
              <label htmlFor="rush-order" className="text-sm font-medium">
                Rush Order (50% faster delivery)
              </label>
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={calculateCost}
              disabled={!templateId || !selectedLocation || isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Cost
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your custom design cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            {costEstimate ? (
              <div className="space-y-4">
                {/* Cost Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base Manufacturing Cost</span>
                    <span className="font-medium">
                      {formatCurrency(costEstimate.base_cost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manufacturing Cost</span>
                    <span className="font-medium">
                      {formatCurrency(costEstimate.manufacturing_cost)}
                    </span>
                  </div>
                  
                  {costEstimate.fabric_cost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fabric Cost</span>
                      <span className="font-medium">
                        {formatCurrency(costEstimate.fabric_cost)}
                      </span>
                    </div>
                  )}
                  
                  {costEstimate.complexity_cost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Complexity Premium</span>
                      <span className="font-medium">
                        {formatCurrency(costEstimate.complexity_cost)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Shipping Cost</span>
                    <span className="font-medium">
                      {formatCurrency(costEstimate.shipping_cost)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Platform Fee (15%)</span>
                    <span className="font-medium">
                      {formatCurrency(costEstimate.platform_fee)}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Cost</span>
                    <span className="text-blue-600">
                      {formatCurrency(costEstimate.total_cost)}
                    </span>
                  </div>
                </div>

                {/* Manufacturing Partner Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    <span className="font-medium text-sm">Manufacturing Partner</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {costEstimate.manufacturing_partner.name}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {costEstimate.manufacturing_partner.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {costEstimate.estimated_delivery_days} days
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {costEstimate.manufacturing_partner.quality_rating}/5
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">What's Included:</div>
                      <ul className="text-xs space-y-1">
                        <li>• Custom tailoring to your measurements</li>
                        <li>• Premium fabric and materials</li>
                        <li>• Quality control and inspection</li>
                        <li>• Worldwide shipping and tracking</li>
                        <li>• 30-day satisfaction guarantee</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select options and calculate cost to see breakdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

