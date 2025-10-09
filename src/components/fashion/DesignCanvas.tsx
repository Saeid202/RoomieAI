import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Shirt, 
  Scissors, 
  Ruler, 
  Eye, 
  Save, 
  Download,
  RotateCcw,
  Settings,
  ShoppingCart,
  Calculator
} from "lucide-react";
import { FashionPlatformService, FabricOption, DesignTemplate, CustomDesign } from '@/services/fashionPlatformService';
import { toast } from 'sonner';

interface DesignCanvasProps {
  measurements?: any;
  onSave?: (design: CustomDesign) => void;
  onOrder?: (design: CustomDesign) => void;
}

export default function DesignCanvas({ measurements, onSave, onOrder }: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<FabricOption | null>(null);
  const [selectedColors, setSelectedColors] = useState<{[key: string]: string}>({});
  const [designData, setDesignData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fabricOptions, setFabricOptions] = useState<FabricOption[]>([]);
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);

  // Load data on component mount
  useEffect(() => {
    loadFabricOptions();
    loadTemplates();
  }, []);

  const loadFabricOptions = async () => {
    try {
      setIsLoading(true);
      const fabrics = await FashionPlatformService.getFabricOptions();
      setFabricOptions(fabrics);
    } catch (error) {
      console.error('Error loading fabric options:', error);
      toast.error('Failed to load fabric options');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templateData = await FashionPlatformService.getDesignTemplates();
      setTemplates(templateData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load design templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setDesignData({
      template_id: template.id,
      name: template.name,
      category: template.category,
      style_type: template.style_type,
      complexity_level: template.complexity_level
    });
    toast.success(`Selected ${template.name}`);
  };

  const handleFabricSelect = (fabric: FabricOption) => {
    setSelectedFabric(fabric);
    setDesignData(prev => ({
      ...prev,
      fabric_id: fabric.id,
      fabric_type: fabric.type,
      fabric_color: fabric.color,
      fabric_pattern: fabric.pattern
    }));
    toast.success(`Selected ${fabric.name} fabric`);
  };

  const handleColorChange = (element: string, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [element]: color
    }));
    setDesignData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [element]: color
      }
    }));
  };

  const handleSaveDesign = async () => {
    if (!selectedTemplate || !selectedFabric) {
      toast.error('Please select a template and fabric before saving');
      return;
    }

    try {
      setIsLoading(true);
      const design: Omit<CustomDesign, 'id' | 'created_at' | 'updated_at'> = {
        user_id: '', // Will be set by the service
        template_id: selectedTemplate.id,
        name: `${selectedTemplate.name} - ${selectedFabric.name}`,
        description: `Custom ${selectedTemplate.category} design`,
        design_data: designData,
        measurements_data: measurements || {},
        fabric_selections: {
          fabric_id: selectedFabric.id,
          fabric_type: selectedFabric.type,
          fabric_color: selectedFabric.color,
          fabric_pattern: selectedFabric.pattern,
          cost_per_meter: selectedFabric.cost_per_meter
        },
        color_customizations: selectedColors,
        status: 'draft',
        is_public: false
      };

      const savedDesign = await FashionPlatformService.saveCustomDesign(design);
      toast.success('Design saved successfully!');
      onSave?.(savedDesign);
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderDesign = async () => {
    if (!selectedTemplate || !selectedFabric) {
      toast.error('Please select a template and fabric before ordering');
      return;
    }

    try {
      setIsLoading(true);
      const design: Omit<CustomDesign, 'id' | 'created_at' | 'updated_at'> = {
        user_id: '', // Will be set by the service
        template_id: selectedTemplate.id,
        name: `${selectedTemplate.name} - ${selectedFabric.name}`,
        description: `Custom ${selectedTemplate.category} design`,
        design_data: designData,
        measurements_data: measurements || {},
        fabric_selections: {
          fabric_id: selectedFabric.id,
          fabric_type: selectedFabric.type,
          fabric_color: selectedFabric.color,
          fabric_pattern: selectedFabric.pattern,
          cost_per_meter: selectedFabric.cost_per_meter
        },
        color_customizations: selectedColors,
        status: 'pending_approval',
        is_public: false
      };

      const savedDesign = await FashionPlatformService.saveCustomDesign(design);
      toast.success('Design saved and ready for ordering!');
      onOrder?.(savedDesign);
    } catch (error) {
      console.error('Error ordering design:', error);
      toast.error('Failed to order design');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !selectedTemplate) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template base (simplified representation)
    ctx.fillStyle = selectedFabric?.color || '#666666';
    ctx.fillRect(50, 50, 200, 300);

    // Draw design elements based on template
    if (selectedTemplate.category === 'suit') {
      // Draw suit jacket
      ctx.fillStyle = selectedColors.jacket || selectedFabric?.color || '#333333';
      ctx.fillRect(60, 60, 180, 120);
      
      // Draw lapels
      ctx.fillStyle = selectedColors.lapels || '#222222';
      ctx.fillRect(70, 70, 160, 20);
      
      // Draw buttons
      ctx.fillStyle = selectedColors.buttons || '#gold';
      ctx.fillRect(120, 100, 8, 8);
      ctx.fillRect(120, 120, 8, 8);
      ctx.fillRect(120, 140, 8, 8);
      
      // Draw pants
      ctx.fillStyle = selectedColors.pants || selectedFabric?.color || '#333333';
      ctx.fillRect(70, 180, 160, 150);
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [selectedTemplate, selectedFabric, selectedColors]);

  const colorPalette = [
    '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
    '#800000', '#FF0000', '#FFA500', '#FFFF00', '#008000', '#00FF00',
    '#0000FF', '#000080', '#800080', '#FF00FF', '#008080', '#00FFFF'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Design Canvas
          </h2>
          <p className="text-muted-foreground">Create your custom fashion design</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDesign}
            disabled={!selectedTemplate || !selectedFabric || isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={handleOrderDesign}
            disabled={!selectedTemplate || !selectedFabric || isLoading}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Order Now
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Design Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Design Preview
            </CardTitle>
            <CardDescription>
              Visual preview of your custom design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={300}
                height={400}
                className="border rounded bg-white mx-auto block"
              />
              {!selectedTemplate && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shirt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a template to start designing</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Design Tools */}
        <Card className="space-y-6">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
              <TabsTrigger value="fabrics" className="text-xs">Fabrics</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Choose Template</h4>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.category} • ${template.base_price}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Level {template.complexity_level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="fabrics" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Select Fabric</h4>
                {fabricOptions.map((fabric) => (
                  <div
                    key={fabric.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFabric?.id === fabric.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFabricSelect(fabric)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: fabric.color.toLowerCase() }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{fabric.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {fabric.type} • ${fabric.cost_per_meter}/m
                        </div>
                      </div>
                      <Badge 
                        variant={fabric.availability === 'in_stock' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {fabric.availability}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Customize Colors</h4>
                {selectedTemplate && (
                  <div className="space-y-3">
                    {selectedTemplate.category === 'suit' && (
                      <>
                        <div>
                          <label className="text-xs text-muted-foreground">Jacket</label>
                          <div className="flex gap-1 mt-1">
                            {colorPalette.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded border ${
                                  selectedColors.jacket === color ? 'border-2 border-blue-500' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange('jacket', color)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Lapels</label>
                          <div className="flex gap-1 mt-1">
                            {colorPalette.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded border ${
                                  selectedColors.lapels === color ? 'border-2 border-blue-500' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange('lapels', color)}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Pants</label>
                          <div className="flex gap-1 mt-1">
                            {colorPalette.map((color) => (
                              <button
                                key={color}
                                className={`w-6 h-6 rounded border ${
                                  selectedColors.pants === color ? 'border-2 border-blue-500' : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange('pants', color)}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {!selectedTemplate && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Select a template to customize colors
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

