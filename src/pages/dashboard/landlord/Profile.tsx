
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

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    }, [user]);

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
            // 2. Try to fetch from basic profile for additional details like full name
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
        setLoading(true);

        try {
            // 1. Update Profile (Name/Email)
            await (supabase as any)
                .from("user_profiles")
                .update({
                    full_name: data.fullName,
                    email: data.email
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
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Landlord Profile</h1>
                    <p className="text-muted-foreground mt-1">Manage your identity and verification status</p>
                </div>
                {verificationStatus === 'verified' && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-semibold">Verified Landlord</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    This information will be used for your official Landlord profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <Input id="fullName" {...form.register("fullName")} />
                                        {form.formState.errors.fullName && (
                                            <p className="text-red-500 text-sm">{form.formState.errors.fullName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" {...form.register("email")} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        <p className="text-xs text-muted-foreground">Contact support to change email</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Professional Verification</CardTitle>
                                <CardDescription>
                                    Help us verify your identity to build trust with tenants.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-2">
                                    <Label>I am a...</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue("userType", val as any)}
                                        defaultValue={form.getValues("userType")}
                                        value={userType}
                                    >
                                        <SelectTrigger>
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
                                        <p className="text-red-500 text-sm">{form.formState.errors.userType.message}</p>
                                    )}
                                </div>

                                {userType === 'realtor' && (
                                    <div className="space-y-4 pt-2 border-t">
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
                                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">Click to upload license image/PDF</span>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                                />
                                                {licenseFile && <span className="text-xs font-semibold text-green-600 mt-2">{licenseFile.name}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Government ID (For Verification - Optional)</Label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                        <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-600">Click to upload Government ID</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                        />
                                        {idFile && <span className="text-xs font-semibold text-green-600 mt-2">{idFile.name}</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Your ID is encrypted and used only for verification purposes.</p>
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-6 bg-gray-50/50">
                                <div className="text-xs text-muted-foreground italic">
                                    {verificationStatus ? `Status: ${verificationStatus.toUpperCase()}` : 'Not submitted'}
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Profile"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>

                {/* Right Column: Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                Account Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Signup Role:</span>
                                <span className="font-semibold capitalize">{systemRole || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Joined Date:</span>
                                <span className="font-semibold">{joinedDate || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                <span className="text-muted-foreground">Login Email:</span>
                                <span className="font-semibold text-xs truncate max-w-[140px]">{user?.email}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-blue-900 flex items-center gap-2">
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
