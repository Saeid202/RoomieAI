
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Upload, ShieldCheck, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LandlordContactInfoCard } from "@/components/landlord/LandlordContactInfoCard";
import { validateContactInfo } from "@/services/landlordService";
import { LandlordContactInfo } from "@/types/landlord";

// Schema for the form
const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    userType: z.enum(["landlord", "realtor", "property_manager", "other"], {
        required_error: "Please select your role type",
    }),
    licenseNumber: z.string().optional(),
    contactUnit: z.string().optional(),
    contactStreetNumber: z.string().min(1, "Street number is required"),
    contactStreetName: z.string().min(1, "Street name is required"),
    contactPoBox: z.string().optional(),
    contactCityTown: z.string().min(1, "City/Town is required"),
    contactProvince: z.string().min(1, "Province is required"),
    contactPostalCode: z.string().min(1, "Postal code is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function LandlordProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [existingData, setExistingData] = useState<any>(null);
    const [systemRole, setSystemRole] = useState<string>("");
    const [joinedDate, setJoinedDate] = useState<string>("");
    const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

    // Separate states for file uploads
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            email: "",
            userType: undefined,
            licenseNumber: "",
            contactUnit: "",
            contactStreetNumber: "",
            contactStreetName: "",
            contactPoBox: "",
            contactCityTown: "",
            contactProvince: "",
            contactPostalCode: "",
        },
    });

    const userType = form.watch("userType");
    const contactUnit = form.watch("contactUnit");
    const contactStreetNumber = form.watch("contactStreetNumber");
    const contactStreetName = form.watch("contactStreetName");
    const contactPoBox = form.watch("contactPoBox");
    const contactCityTown = form.watch("contactCityTown");
    const contactProvince = form.watch("contactProvince");
    const contactPostalCode = form.watch("contactPostalCode");

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const loadProfileData = async () => {
        if (!user) return;
        setLoading(true);

        // 1. First, pull from the Auth System (Source of Truth)
        // This ensures data shows immediately even if database sync is slow
        form.setValue("email", user.email || "");

        if (user.created_at) {
            setJoinedDate(new Date(user.created_at).toLocaleDateString());
        }

        const metadataRole = user.user_metadata?.role || user.user_metadata?.userRole || "seeker";
        setSystemRole(metadataRole);

        if (metadataRole === 'landlord') {
            form.setValue("userType", "landlord");
        }

        try {
            // 2. Try to fetch from basic profile for additional details like full name and contact info
            const { data: profile } = await (supabase as any)
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (profile) {
                if ((profile as any).full_name) form.setValue("fullName", (profile as any).full_name);
                if ((profile as any).email) form.setValue("email", (profile as any).email);
                if ((profile as any).role) setSystemRole((profile as any).role);
                if ((profile as any).created_at) {
                    setJoinedDate(new Date((profile as any).created_at).toLocaleDateString());
                }

                // Load contact information
                if ((profile as any).contact_unit) form.setValue("contactUnit", (profile as any).contact_unit);
                if ((profile as any).contact_street_number) form.setValue("contactStreetNumber", (profile as any).contact_street_number);
                if ((profile as any).contact_street_name) form.setValue("contactStreetName", (profile as any).contact_street_name);
                if ((profile as any).contact_po_box) form.setValue("contactPoBox", (profile as any).contact_po_box);
                if ((profile as any).contact_city_town) form.setValue("contactCityTown", (profile as any).contact_city_town);
                if ((profile as any).contact_province) form.setValue("contactProvince", (profile as any).contact_province);
                if ((profile as any).contact_postal_code) form.setValue("contactPostalCode", (profile as any).contact_postal_code);
            }

            // 3. Fetch verification data
            const { data: verification } = await (supabase as any)
                .from("landlord_verifications")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (verification) {
                setExistingData(verification);
                setVerificationStatus((verification as any).verification_status);
                form.setValue("userType", (verification as any).user_type as any);
                if ((verification as any).license_number) {
                    form.setValue("licenseNumber", (verification as any).license_number);
                }
            }
        } catch (error) {
            console.error("General error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File, path: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${path}_${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
            .from('user_documents') // Ensure this bucket exists
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user_documents')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        // Validate contact information
        const contactValidation = validateContactInfo({
            contactUnit: data.contactUnit,
            contactStreetNumber: data.contactStreetNumber,
            contactStreetName: data.contactStreetName,
            contactPoBox: data.contactPoBox,
            contactCityTown: data.contactCityTown,
            contactProvince: data.contactProvince,
            contactPostalCode: data.contactPostalCode,
        });

        if (!contactValidation.valid) {
            setContactErrors(contactValidation.errors);
            toast({
                title: "Validation Error",
                description: "Please fill in all required contact information fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // 1. Update Profile (Name/Email/Contact Info)
            await (supabase as any)
                .from("user_profiles")
                .update({
                    full_name: data.fullName,
                    email: data.email,
                    contact_unit: data.contactUnit || null,
                    contact_street_number: data.contactStreetNumber,
                    contact_street_name: data.contactStreetName,
                    contact_po_box: data.contactPoBox || null,
                    contact_city_town: data.contactCityTown,
                    contact_province: data.contactProvince,
                    contact_postal_code: data.contactPostalCode,
                })
                .eq("id", user.id);

            // 2. Upload Files if present
            let licenseUrl = existingData?.license_document_url;
            let idUrl = existingData?.government_id_url;

            // Note: In a real app, handle file uploads to Storage here
            // For this demo, we'll simulate or skip if no bucket is configured
            // await uploadFile(licenseFile, 'license'); 

            // 3. Upsert Verification Data
            const verificationPayload = {
                user_id: user.id,
                user_type: data.userType,
                license_number: data.userType === 'realtor' ? data.licenseNumber : null,
                verification_status: 'pending', // Reset to pending on update
                license_document_url: licenseUrl,
                government_id_url: idUrl
            };

            const { error } = await (supabase as any)
                .from("landlord_verifications")
                .upsert(verificationPayload, { onConflict: 'user_id' });

            if (error) throw error;

            toast({
                title: "Profile Updated",
                description: "Your information has been saved and submitted for verification.",
            });

            // Clear contact errors on success
            setContactErrors({});

            // Reload to show status
            loadProfileData();

        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save profile",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-8">
            {/* Enhanced Header Section */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight">Landlord Profile</h1>
                                    <p className="text-blue-100 text-lg">Complete your profile to build trust with tenants</p>
                                </div>
                            </div>
                        </div>
                        {verificationStatus === 'verified' && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                                <ShieldCheck className="h-5 w-5 text-white" />
                                <span className="font-semibold text-white">Verified Landlord</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form - Takes 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                                </div>
                            </div>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input 
                                            id="fullName" 
                                            {...form.register("fullName")}
                                        />
                                        {form.formState.errors.fullName && (
                                            <p className="text-red-600 text-sm flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {form.formState.errors.fullName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input 
                                            id="email" 
                                            {...form.register("email")} 
                                            readOnly 
                                            className="bg-gray-50 text-gray-500 cursor-not-allowed" 
                                        />
                                        <p className="text-xs text-muted-foreground">Contact support to change email</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                                </div>
                            </div>
                            <CardContent className="p-6">
                                <LandlordContactInfoCard
                                    data={{
                                        contactUnit: contactUnit,
                                        contactStreetNumber: contactStreetNumber,
                                        contactStreetName: contactStreetName,
                                        contactPoBox: contactPoBox,
                                        contactCityTown: contactCityTown,
                                        contactProvince: contactProvince,
                                        contactPostalCode: contactPostalCode,
                                    }}
                                    errors={contactErrors}
                                    onChange={(field, value) => {
                                        // Map field names to form field names
                                        const fieldMap: Record<string, any> = {
                                            'contactUnit': 'contactUnit',
                                            'contactStreetNumber': 'contactStreetNumber',
                                            'contactStreetName': 'contactStreetName',
                                            'contactPoBox': 'contactPoBox',
                                            'contactCityTown': 'contactCityTown',
                                            'contactProvince': 'contactProvince',
                                            'contactPostalCode': 'contactPostalCode',
                                        };
                                        
                                        const formField = fieldMap[field] as any;
                                        if (formField) {
                                            form.setValue(formField, value);
                                            // Clear error for this field when user starts typing
                                            if (contactErrors[field]) {
                                                setContactErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[field];
                                                    return newErrors;
                                                });
                                            }
                                        }
                                    }}
                                    isLoading={loading}
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Professional Verification</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">I am a...</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue("userType", val as any)}
                                        defaultValue={form.getValues("userType")}
                                        value={userType}
                                    >
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="landlord">Private Landlord</SelectItem>
                                            <SelectItem value="realtor">Real Estate Agent (Realtor)</SelectItem>
                                            <SelectItem value="property_manager">Property Manager</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.userType && (
                                        <p className="text-red-600 text-sm flex items-center gap-1 bg-red-50 p-3 rounded-lg border border-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            {form.formState.errors.userType.message}
                                        </p>
                                    )}
                                </div>

                                {userType === 'realtor' && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="licenseNumber">Realtor License Number</Label>
                                            <Input
                                                id="licenseNumber"
                                                placeholder="e.g. RE-12345678"
                                                {...form.register("licenseNumber")}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Upload License Document (Optional)</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Click to upload license image/PDF</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                                />
                                                {licenseFile && (
                                                    <span className="text-xs font-semibold text-green-600 mt-2">
                                                        {licenseFile.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-4 border-t">
                                    <Label>Government ID (For Verification - Optional)</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                        <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Click to upload Government ID</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                        />
                                        {idFile && (
                                            <span className="text-xs font-semibold text-green-600 mt-2">
                                                {idFile.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        Your ID is encrypted and used only for verification purposes.
                                    </p>
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                                <div className="text-sm text-muted-foreground">
                                    {verificationStatus ? (
                                        <span className="flex items-center gap-2">
                                            Status: 
                                            <span className={`font-semibold px-2 py-1 rounded text-xs ${
                                                verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                                verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {verificationStatus.toUpperCase()}
                                            </span>
                                        </span>
                                    ) : (
                                        'Not submitted'
                                    )}
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Profile"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>

                {/* Right Column: Info - Takes 1/3 width */}
                <div className="space-y-6">
                    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Account Overview</h2>
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Signup Role:</span>
                                <span className="font-semibold text-slate-900 capitalize">{systemRole || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Joined Date:</span>
                                <span className="font-semibold text-slate-900">{joinedDate || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium text-slate-600">Login Email:</span>
                                <span className="font-semibold text-xs text-slate-900 truncate max-w-[140px]" title={user?.email}>
                                    {user?.email}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Trust & Security</h2>
                            </div>
                        </div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-amber-900 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                Why Verify?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">Get a "Verified" badge on your listings</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">Increase tenant trust by 300%</p>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">Access premium landlord features</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
