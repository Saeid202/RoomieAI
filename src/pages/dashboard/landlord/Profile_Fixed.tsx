import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema for the form
const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    userType: z.enum(["landlord", "realtor", "property_manager", "other"], {
        required_error: "Please select your role type",
    }),
    licenseNumber: z.string().optional(),
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
        },
    });

    const userType = form.watch("userType");

    // Load existing profile data
    useEffect(() => {
        const loadProfileData = async () => {
            if (!user) return;

            try {
                // Get user metadata
                const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
                if (userError || !userData) return;

                // Get system role from user metadata
                setSystemRole(userData.user_metadata?.user_type || "");
                setJoinedDate(userData.created_at ? new Date(userData.created_at).toLocaleDateString() : "");

                // Load existing verification data
                const { data: verificationData, error: verificationError } = await supabase
                    .from("landlord_verifications")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (verificationError && verificationError.code !== "PGRST116") {
                    console.error("Error loading verification data:", verificationError);
                }

                if (verificationData) {
                    setExistingData(verificationData);
                    setVerificationStatus(verificationData.verification_status);
                    
                    // Populate form with existing data
                    form.reset({
                        fullName: userData.user_metadata?.full_name || "",
                        email: userData.email || "",
                        userType: verificationData.user_type || undefined,
                        licenseNumber: verificationData.license_number || "",
                    });
                } else {
                    // Set default values from user metadata
                    form.reset({
                        fullName: userData.user_metadata?.full_name || "",
                        email: userData.email || "",
                        userType: undefined,
                        licenseNumber: "",
                    });
                }
            } catch (error) {
                console.error("Error loading profile data:", error);
            }
        };

        loadProfileData();
    }, [user, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        setLoading(true);

        try {
            // 1. Update user metadata (for fullName)
            const { error: metadataError } = await supabase.auth.updateUser({
                data: {
                    full_name: data.fullName,
                }
            });

            if (metadataError) throw metadataError;

            // 2. Handle file uploads (simplified for demo)
            let licenseUrl = existingData?.license_document_url;
            let idUrl = existingData?.government_id_url;

            // 3. Upsert Verification Data
            const verificationPayload = {
                user_id: user.id,
                user_type: data.userType,
                license_number: data.userType === 'realtor' ? data.licenseNumber : null,
                verification_status: 'pending',
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

            // Reload to show status
            window.location.reload();

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Landlord Profile
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Manage your identity and verification status to build trust with tenants.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-500">Secure verification system</span>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Left Side - Form */}
                    <div className="flex-1 lg:max-w-4xl border-r-2 border-purple-200">
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-8 text-left pl-6">
                                {verificationStatus === 'verified' && (
                                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span className="font-semibold">Verified Landlord</span>
                                    </div>
                                )}

                                {/* Personal Information Card */}
                                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                                <ShieldCheck className="h-5 w-5 text-white" />
                                            </div>
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription className="text-purple-700 font-medium">
                                            This information will be used for your official Landlord profile.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</Label>
                                                <Input id="fullName" {...form.register("fullName")} className="border-purple-200 focus:border-purple-400" />
                                                {form.formState.errors.fullName && (
                                                    <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                                                <Input id="email" {...form.register("email")} readOnly className="bg-purple-50 text-purple-600 cursor-not-allowed border-purple-200" />
                                                <p className="text-xs text-purple-600">Contact support to change email</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Professional Verification Card */}
                                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                                <ShieldCheck className="h-5 w-5 text-white" />
                                            </div>
                                            Professional Verification
                                        </CardTitle>
                                        <CardDescription className="text-purple-700 font-medium">
                                            Help us verify your identity to build trust with tenants.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">I am a...</Label>
                                            <Select
                                                onValueChange={(val) => form.setValue("userType", val as any)}
                                                defaultValue={form.getValues("userType")}
                                                value={userType}
                                            >
                                                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="landlord">Landlord</SelectItem>
                                                    <SelectItem value="realtor">Realtor</SelectItem>
                                                    <SelectItem value="property_manager">Property Manager</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.formState.errors.userType && (
                                                <p className="text-red-500 text-sm">{form.formState.errors.userType.message}</p>
                                            )}
                                        </div>

                                        {userType === 'realtor' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="licenseNumber" className="text-sm font-medium text-slate-700">License Number</Label>
                                                <Input
                                                    id="licenseNumber"
                                                    placeholder="Enter your real estate license number"
                                                    {...form.register("licenseNumber")}
                                                    className="border-purple-200 focus:border-purple-400"
                                                />
                                                {form.formState.errors.licenseNumber && (
                                                    <p className="text-red-500 text-sm">{form.formState.errors.licenseNumber.message}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* File Upload Areas */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">License Document (if applicable)</Label>
                                                <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                                                    <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                                    />
                                                    {licenseFile && <span className="text-xs font-semibold text-green-600 mt-2">{licenseFile.name}</span>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Government ID</Label>
                                                <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                                                    <Upload className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                                    />
                                                    {idFile && <span className="text-xs font-semibold text-green-600 mt-2">{idFile.name}</span>}
                                                </div>
                                                <p className="text-xs text-purple-600">Your ID is encrypted and used only for verification purposes.</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end pt-8">
                                    <Button 
                                        type="submit" 
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] text-lg" 
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                                Saving Profile...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Profile
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Side - Progress & Tips */}
                    <div className="lg:w-80 space-y-6">
                        {/* Account Overview Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                    </div>
                                    Account Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Signup Role:</span>
                                    <span className="font-semibold capitalize text-purple-600">{systemRole || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Joined Date:</span>
                                    <span className="font-semibold text-purple-600">{joinedDate || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-purple-100 pt-3 mt-3">
                                    <span className="text-slate-600">Login Email:</span>
                                    <span className="font-semibold text-xs truncate max-w-[140px] text-purple-600">{user?.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Why Verify Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                        <ShieldCheck className="h-4 w-4 text-white" />
                                    </div>
                                    Why Verify?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">Get a "Verified" badge on your listings</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">Build trust with potential tenants</p>
                                </div>
                                <div className="flex gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">Priority placement in search results</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
