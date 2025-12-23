import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Phone, Mail, MapPin, Edit2, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RenovatorProfileData {
    id?: string;
    company: string;
    name: string;
    phone: string;
    email: string;
    location: string;
    description: string;
    specialties: string[];
    verified?: boolean;
}

export default function RenovatorProfile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<RenovatorProfileData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<RenovatorProfileData>({
        company: "",
        name: "",
        phone: "",
        email: "",
        location: "",
        description: "",
        specialties: []
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('renovation_partners' as any)
                .select('*')
                .eq('user_id', user!.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching profile:", error);
            }

            if (data) {
                setProfile(data as any);
                setFormData({
                    company: data.company,
                    name: data.name,
                    phone: data.phone || "",
                    email: data.email || user!.email || "",
                    location: data.location,
                    description: data.description || "",
                    specialties: data.specialties || []
                });
            } else {
                setProfile(null);
                setFormData(prev => ({ ...prev, email: user!.email || "" }));
            }
        } catch (err) {
            console.error("Exception fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                user_id: user!.id,
                company: formData.company,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                location: formData.location,
                description: formData.description,
                specialties: formData.specialties || [],
                updated_at: new Date().toISOString()
            };

            let result;
            if (profile?.id) {
                result = await supabase
                    .from('renovation_partners' as any)
                    .update(payload)
                    .eq('id', profile.id)
                    .select()
                    .single();
            } else {
                result = await supabase
                    .from('renovation_partners' as any)
                    .insert([payload])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            setProfile(result.data as any);
            setIsDialogOpen(false);
            toast({ title: "Success", description: "Profile saved successfully." });
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast({ variant: "destructive", title: "Save Failed", description: error.message || "Could not save profile" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    // View Mode (if profile exists)
    if (profile) {
        return (
            <div className="container mx-auto p-6 space-y-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{profile.company}</h1>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <User className="h-4 w-4" /> {profile.name}
                        </p>
                    </div>
                    <div>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                            <Edit2 className="h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>About Us</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.description || "No description provided."}</p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {profile.specialties?.map((spec, i) => (
                                    <Badge key={i} variant="secondary">{spec}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <span>{profile.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="text-sm truncate" title={profile.email}>{profile.email || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <span>{profile.location || "N/A"}</span>
                            </div>
                            {profile.verified && (
                                <div className="mt-4 p-2 bg-green-50 text-green-700 text-sm rounded border border-green-200 text-center font-medium">
                                    Verified Partner
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Dialog (Reused) */}
                <EditDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    saving={saving}
                    isCreate={false}
                />
            </div>
        );
    }

    // Create Mode (Empty State)
    return (
        <div className="container mx-auto p-6 py-12 max-w-2xl">
            <Card className="border-2 border-dashed border-gray-300 shadow-sm">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Create Your Business Profile</CardTitle>
                    <p className="text-gray-500">
                        Set up your renovator profile to start receiving job requests and managing your work.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-w-md mx-auto mt-6">
                        <Button
                            className="w-full h-12 text-lg"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Create Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <EditDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                saving={saving}
                isCreate={true}
            />
        </div>
    );
}

// Sub-component for the Form Dialog to keep main clean
function EditDialog({ open, onOpenChange, formData, setFormData, onSave, saving, isCreate }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isCreate ? "Create Business Profile" : "Edit Profile"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSave} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name *</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Acme Renovations"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Contact Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Base Location (City) *</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Toronto, ON"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Public Email</Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@acme.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">About Your Business</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell customers about your experience and services..."
                            className="h-24"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isCreate ? "Create Profile" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
