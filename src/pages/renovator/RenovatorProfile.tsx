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
import { User, Building, Phone, Mail, MapPin, Edit2, Save, Loader2, Globe, ShieldCheck, CheckCircle2, FileText, Upload } from "lucide-react";
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
    website_url?: string;
    business_scope?: string;
    license_url?: string;
    government_id_url?: string;
    verified?: boolean;
}

export default function RenovatorProfile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<RenovatorProfileData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Metadata from signup
    const [joinedDate, setJoinedDate] = useState<string>("");

    // Form State
    const [formData, setFormData] = useState<RenovatorProfileData>({
        company: "",
        name: "",
        phone: "",
        email: "",
        location: "",
        description: "",
        specialties: [],
        website_url: "",
        business_scope: ""
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
            if (user.created_at) {
                setJoinedDate(new Date(user.created_at).toLocaleDateString());
            }
        }
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('renovation_partners')
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
                    specialties: data.specialties || [],
                    website_url: data.website_url || "",
                    business_scope: data.business_scope || "",
                    license_url: data.license_url,
                    government_id_url: data.government_id_url
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

    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'id') => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setUploadingDoc(type);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${type}_${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('renovation-partner-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('renovation-partner-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({
                ...prev,
                [type === 'license' ? 'license_url' : 'government_id_url']: publicUrl
            }));

            toast({ title: "Success", description: `${type === 'license' ? 'License' : 'ID'} uploaded.` });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({ variant: "destructive", title: "Upload failed", description: error.message });
        } finally {
            setUploadingDoc(null);
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
                website_url: formData.website_url,
                business_scope: formData.business_scope,
                license_url: formData.license_url,
                government_id_url: formData.government_id_url,
                updated_at: new Date().toISOString()
            };

            let result;
            if (profile?.id) {
                result = await (supabase as any)
                    .from('renovation_partners')
                    .update(payload)
                    .eq('id', profile.id)
                    .select()
                    .single();
            } else {
                result = await (supabase as any)
                    .from('renovation_partners')
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
            <div className="container mx-auto p-6 space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{profile.company}</h1>
                        <p className="text-gray-500 flex items-center gap-1 mt-1 font-medium">
                            <User className="h-4 w-4" /> {profile.name}
                        </p>
                    </div>
                    <div>
                        <Button onClick={() => setIsDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Edit2 className="h-4 w-4" /> Edit Profile
                        </Button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Business Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5 text-primary" />
                                    Business Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Company Name</h4>
                                        <p className="text-sm font-bold text-slate-900">{profile.company}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Contact Person</h4>
                                        <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-900">Description</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {profile.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-slate-900">Business Scope</h4>
                                        <p className="text-sm text-slate-600">
                                            {profile.business_scope || "Not specified"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-slate-900">Website</h4>
                                        {profile.website_url ? (
                                            <a href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                <Globe className="h-3 w-3" /> {profile.website_url}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No website provided</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900 mb-3">Specialties</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specialties?.length > 0 ? (
                                            profile.specialties.map((spec, i) => (
                                                <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{spec}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No specialties listed</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Verification Documents */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Verification Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className={`p-4 rounded-lg border flex items-center justify-between ${profile.license_url ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className={`h-5 w-5 ${profile.license_url ? 'text-green-600' : 'text-slate-400'}`} />
                                            <div>
                                                <p className="font-bold">Business License</p>
                                                <p className="text-[10px] text-slate-500">{profile.license_url ? 'View Document' : 'Action Required'}</p>
                                            </div>
                                        </div>
                                        {profile.license_url ? (
                                            <a href={profile.license_url} target="_blank" rel="noopener noreferrer">
                                                <Badge className="bg-green-100 text-green-700 text-[10px] cursor-pointer hover:bg-green-200 transition-colors">Verified ✓</Badge>
                                            </a>
                                        ) : <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Missing</Badge>}
                                    </div>

                                    <div className={`p-4 rounded-lg border flex items-center justify-between ${profile.government_id_url ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <User className={`h-5 w-5 ${profile.government_id_url ? 'text-green-600' : 'text-slate-400'}`} />
                                            <div>
                                                <p className="font-bold">Government ID</p>
                                                <p className="text-[10px] text-slate-500">{profile.government_id_url ? 'View Document' : 'Action Required'}</p>
                                            </div>
                                        </div>
                                        {profile.government_id_url ? (
                                            <a href={profile.government_id_url} target="_blank" rel="noopener noreferrer">
                                                <Badge className="bg-green-100 text-green-700 text-[10px] cursor-pointer hover:bg-green-200 transition-colors">Identified ✓</Badge>
                                            </a>
                                        ) : <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">Missing</Badge>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Sidebar info */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-wider text-slate-500 font-bold">Account Context</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Joined Date</span>
                                    <span className="font-bold text-slate-900">{joinedDate || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t pt-3 border-dashed">
                                    <span className="text-slate-500">Primary Email</span>
                                    <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]" title={user?.email}>{user?.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-wider text-slate-500 font-bold">Contact Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Business Phone</p>
                                        <p className="text-sm font-bold text-slate-900">{profile.phone || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Public Email</p>
                                        <p className="text-sm font-bold text-slate-900 truncate max-w-[160px]" title={profile.email}>{profile.email || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Headquarters</p>
                                        <p className="text-sm font-bold text-slate-900">{profile.location || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-900 to-slate-900 text-white border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                                    Verification Power
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                    <p className="text-[11px] leading-relaxed">Verified partners appear first in crisis alerts.</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                    <p className="text-[11px] leading-relaxed">Boost trust with landlords and property managers.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit Dialog */}
                <EditDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onFileUpload={handleFileUpload}
                    uploadingDoc={uploadingDoc}
                    saving={saving}
                    isCreate={false}
                />
            </div>
        );
    }

    // Create Mode (Empty State)
    return (
        <div className="container mx-auto p-6 py-12 max-w-2xl">
            <Card className="border-2 border-dashed border-gray-300 shadow-sm overflow-hidden">
                <div className="h-2 bg-primary w-full"></div>
                <CardHeader className="text-center pb-2 pt-8">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-inner">
                        <Building className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold text-slate-900">Finalize Your Business Hub</CardTitle>
                    <p className="text-slate-500 max-w-sm mx-auto mt-4 px-4 leading-relaxed">
                        Complete your renovator credentials to start bidding on emergency repairs and building your reputation.
                    </p>
                </CardHeader>
                <CardContent className="pb-12 px-10">
                    <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <ShieldCheck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-800">Verified Badge</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                <MapPin className="h-6 w-6 text-red-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-800">Live Territory</p>
                            </div>
                        </div>
                        <Button
                            className="w-full h-14 text-lg font-bold shadow-xl hover:translate-y-[-2px] transition-all"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Set Up My Profile
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
                onFileUpload={handleFileUpload}
                uploadingDoc={uploadingDoc}
                saving={saving}
                isCreate={true}
            />
        </div>
    );
}

// Sub-component for the Form Dialog to keep main clean
function EditDialog({ open, onOpenChange, formData, setFormData, onSave, onFileUpload, uploadingDoc, saving, isCreate }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
                <div className="h-1.5 bg-primary w-full sticky top-0 z-10"></div>
                <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-black text-slate-900">
                        {isCreate ? "Initialize Business Context" : "Refine Business Profile"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSave} className="space-y-6 px-8 pb-8">
                    {/* Basic Context */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-2">
                            <Building className="h-3 w-3" /> Core Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-xs font-bold text-slate-700">Company Legal Name *</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Acme Toronto Renovations"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold text-slate-700">Point of Contact Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Network */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-2">
                            <Globe className="h-3 w-3" /> Digital Presence
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website" className="text-xs font-bold text-slate-700">Business Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website_url}
                                    onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                                    placeholder="https://yourbusiness.com"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-xs font-bold text-slate-700">Main Service City *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Toronto, ON"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Communication */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-2">
                            <Phone className="h-3 w-3" /> Communication
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Business Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold text-slate-700">Public Email</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@acme.com"
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scope & Description */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-2">
                            <FileText className="h-3 w-3" /> Service Depth
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="business_scope" className="text-xs font-bold text-slate-700">Business Scope (Summary)</Label>
                            <Input
                                id="business_scope"
                                value={formData.business_scope}
                                onChange={e => setFormData({ ...formData, business_scope: e.target.value })}
                                placeholder="Summary of areas and scope you cover..."
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold text-slate-700">Full Business Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell customers about your journey, reliability, and specific skills..."
                                className="h-28 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Form Documents Upload */}
                    <div className="space-y-4 border-t pt-6 bg-slate-50/50 -mx-8 px-8 pb-4">
                        <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2 mb-4">
                            <Upload className="h-3 w-3" /> Credentials (PDF/Image)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* License Input */}
                            <div
                                className={`border border-dashed rounded-lg p-4 bg-white transition-colors cursor-pointer text-center group ${formData.license_url ? 'border-green-200 bg-green-50/30' : 'border-slate-300 hover:border-primary'}`}
                                onClick={() => document.getElementById('license-upload')?.click()}
                            >
                                <input id="license-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => onFileUpload(e, 'license')} />
                                {uploadingDoc === 'license' ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /> : <ShieldCheck className={`h-5 w-5 mx-auto mb-2 ${formData.license_url ? 'text-green-600' : 'text-slate-400 group-hover:text-primary'}`} />}
                                <p className="text-[10px] font-bold text-slate-600">{formData.license_url ? 'License Uploaded' : 'Business License'}</p>
                                <p className="text-[9px] text-slate-400">{formData.license_url ? 'Click to replace' : 'Click to upload license'}</p>
                            </div>

                            {/* ID Input */}
                            <div
                                className={`border border-dashed rounded-lg p-4 bg-white transition-colors cursor-pointer text-center group ${formData.government_id_url ? 'border-green-200 bg-green-50/30' : 'border-slate-300 hover:border-primary'}`}
                                onClick={() => document.getElementById('id-upload')?.click()}
                            >
                                <input id="id-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => onFileUpload(e, 'id')} />
                                {uploadingDoc === 'id' ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /> : <User className={`h-5 w-5 mx-auto mb-2 ${formData.government_id_url ? 'text-green-600' : 'text-slate-400 group-hover:text-primary'}`} />}
                                <p className="text-[10px] font-bold text-slate-600">{formData.government_id_url ? 'ID Uploaded' : 'Government ID'}</p>
                                <p className="text-[9px] text-slate-400">{formData.government_id_url ? 'Click to replace' : 'Click to upload ID'}</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t -mx-8 px-8">
                        <Button type="button" variant="link" className="text-slate-500 font-bold" onClick={() => onOpenChange(false)}>Discard</Button>
                        <Button type="submit" disabled={saving} className="px-10 h-11 font-black shadow-lg">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isCreate ? "Finalize Profile" : "Sync Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

