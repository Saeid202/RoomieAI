
import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Globe, Loader2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ServiceAreaItem {
    id: string;
    city: string;
    radius_km: number;
}

export default function ServiceArea() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [renovatorId, setRenovatorId] = useState<string | null>(null);
    const [areas, setAreas] = useState<ServiceAreaItem[]>([]);

    // Form state
    const [newCity, setNewCity] = useState("");
    const [newRadius, setNewRadius] = useState([25]); // Default 25km

    useEffect(() => {
        fetchRenovatorAndAreas();
    }, []);

    const fetchRenovatorAndAreas = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: renovator } = await supabase
                .from('renovation_partners' as any)
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (renovator) {
                setRenovatorId((renovator as any).id);
                const { data: serviceAreas, error } = await supabase
                    .from('renovator_service_areas' as any)
                    .select('*')
                    .eq('renovator_id', (renovator as any).id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setAreas(serviceAreas || []);
            }
        } catch (error: any) {
            console.error("Error loading service areas:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to load service areas."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCity.trim()) return;
        if (!renovatorId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "You need a renovator profile first."
            });
            return;
        }

        setAdding(true);
        try {
            const { data, error } = await supabase
                .from('renovator_service_areas' as any)
                .insert([{
                    renovator_id: renovatorId,
                    city: newCity.trim(),
                    radius_km: newRadius[0]
                }])
                .select()
                .single();

            if (error) throw error;

            setAreas([data, ...areas]);
            setNewCity("");
            setNewRadius([25]);
            toast({
                title: "Area Added",
                description: `Successfully added ${newCity} to your service area.`
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to add",
                description: error.message
            });
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string, cityName: string) => {
        try {
            const { error } = await supabase
                .from('renovator_service_areas' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAreas(areas.filter(a => a.id !== id));
            toast({
                title: "Area Removed",
                description: `Stopped serving ${cityName}.`
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: error.message
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!renovatorId) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <Navigation className="h-4 w-4" />
                    <AlertTitle>Profile Required</AlertTitle>
                    <AlertDescription>
                        Please create your renovator profile in the "Profile" section before adding service areas.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Service Area</h1>
                </div>
                <p className="text-muted-foreground ml-12">
                    Manage the geographical regions where you offer your renovation services.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Adding Form */}
                <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit sticky top-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Area</CardTitle>
                        <CardDescription>Define a new city and coverage radius.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddArea} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City Name</label>
                                <Input
                                    placeholder="e.g. Toronto, ON"
                                    value={newCity}
                                    onChange={(e) => setNewCity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">Radius</label>
                                    <Badge variant="secondary" className="font-mono">{newRadius[0]} km</Badge>
                                </div>
                                <Slider
                                    value={newRadius}
                                    onValueChange={setNewRadius}
                                    max={200}
                                    step={5}
                                    className="py-4"
                                />
                                <p className="text-[10px] text-slate-400 text-center italic">
                                    Covers approximately {(Math.PI * Math.pow(newRadius[0], 2)).toLocaleString(undefined, { maximumFractionDigits: 0 })} sq. km
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gap-2"
                                disabled={adding || !newCity.trim()}
                            >
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add Service Area
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Areas List */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Globe className="h-5 w-5 text-slate-400" />
                            Active Service Regions
                        </h2>
                        <Badge variant="outline">{areas.length} Locations</Badge>
                    </div>

                    {areas.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed rounded-xl p-12 text-center text-slate-500">
                            <Navigation className="h-10 w-10 mx-auto mb-4 opacity-20" />
                            <p className="font-medium text-slate-600">No service areas defined yet</p>
                            <p className="text-sm">Start by adding your primary city in the left panel.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {areas.map((area) => (
                                <Card key={area.id} className="group hover:border-primary/30 transition-all duration-300 overflow-hidden">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{area.city}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                    <Navigation className="h-3 w-3" />
                                                    <span>{area.radius_km}km coverage radius</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete(area.id, area.city)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="h-1 w-full bg-slate-50">
                                        <div
                                            className="h-full bg-primary/20 group-hover:bg-primary/40 transition-all duration-500"
                                            style={{ width: `${Math.min((area.radius_km / 200) * 100, 100)}%` }}
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
