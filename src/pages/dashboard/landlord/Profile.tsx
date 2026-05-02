
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Upload, ShieldCheck, CreditCard, User, MapPin, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LandlordContactInfoCard } from "@/components/landlord/LandlordContactInfoCard";
import { validateContactInfo } from "@/services/landlordService";

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

// Reusable section header with number badge
function SectionHeader({ number, icon: Icon, title, subtitle }: {
    number: number;
    icon: React.ElementType;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">{number}</span>
            </div>
            <div className="flex items-start gap-2.5 pt-0.5">
                <Icon className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                <div>
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}

export default function LandlordProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [existingData, setExistingData] = useState<any>(null);
    const [systemRole, setSystemRole] = useState<string>("");
    const [joinedDate, setJoinedDate] = useState<string>("");
    const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
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
        if (user) loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const loadProfileData = async () => {
        if (!user) return;
        setLoading(true);
        form.setValue("email", user.email || "");
        if (user.created_at) setJoinedDate(new Date(user.created_at).toLocaleDateString());
        const metadataRole = user.user_metadata?.role || user.user_metadata?.userRole || "seeker";
        setSystemRole(metadataRole);
        if (metadataRole === 'landlord') form.setValue("userType", "landlord");

        try {
            const { data: profile } = await (supabase as any)
                .from("user_profiles").select("*").eq("id", user.id).maybeSingle();

            if (profile) {
                if ((profile as any).full_name) form.setValue("fullName", (profile as any).full_name);
                if ((profile as any).email) form.setValue("email", (profile as any).email);
                if ((profile as any).role) setSystemRole((profile as any).role);
                if ((profile as any).created_at) setJoinedDate(new Date((profile as any).created_at).toLocaleDateString());
                if ((profile as any).contact_unit) form.setValue("contactUnit", (profile as any).contact_unit);
                if ((profile as any).contact_street_number) form.setValue("contactStreetNumber", (profile as any).contact_street_number);
                if ((profile as any).contact_street_name) form.setValue("contactStreetName", (profile as any).contact_street_name);
                if ((profile as any).contact_po_box) form.setValue("contactPoBox", (profile as any).contact_po_box);
                if ((profile as any).contact_city_town) form.setValue("contactCityTown", (profile as any).contact_city_town);
                if ((profile as any).contact_province) form.setValue("contactProvince", (profile as any).contact_province);
                if ((profile as any).contact_postal_code) form.setValue("contactPostalCode", (profile as any).contact_postal_code);
            }

            const { data: verification } = await (supabase as any)
                .from("landlord_verifications").select("*").eq("user_id", user.id).maybeSingle();

            if (verification) {
                setExistingData(verification);
                setVerificationStatus((verification as any).verification_status);
                form.setValue("userType", (verification as any).user_type as any);
                if ((verification as any).license_number) form.setValue("licenseNumber", (verification as any).license_number);
            }
        } catch (error) {
            console.error("General error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

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
            toast({ title: "Validation Error", description: "Please fill in all required contact information fields.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await (supabase as any).from("user_profiles").update({
                full_name: data.fullName,
                email: data.email,
                contact_unit: data.contactUnit || null,
                contact_street_number: data.contactStreetNumber,
                contact_street_name: data.contactStreetName,
                contact_po_box: data.contactPoBox || null,
                contact_city_town: data.contactCityTown,
                contact_province: data.contactProvince,
                contact_postal_code: data.contactPostalCode,
            }).eq("id", user.id);

            const verificationPayload = {
                user_id: user.id,
                user_type: data.userType,
                license_number: data.userType === 'realtor' ? data.licenseNumber : null,
                verification_status: 'pending',
                license_document_url: existingData?.license_document_url,
                government_id_url: existingData?.government_id_url,
            };

            const { error } = await (supabase as any)
                .from("landlord_verifications").upsert(verificationPayload, { onConflict: 'user_id' });

            if (error) throw error;

            toast({ title: "Profile Updated", description: "Your information has been saved and submitted for verification." });
            setContactErrors({});
            loadProfileData();
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast({ title: "Error", description: error.message || "Failed to save profile", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="relative bg-violet-700 rounded-2xl px-8 py-6 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                    <div className="absolute -top-8 -right-8 w-48 h-48 bg-violet-500 rounded-full opacity-20 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white/20 rounded-xl">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">Landlord Portal</p>
                                <h1 className="text-2xl font-bold text-white leading-tight">Landlord Profile</h1>
                            </div>
                        </div>
                        {verificationStatus === 'verified' && (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                                <ShieldCheck className="h-4 w-4 text-white" />
                                <span className="text-sm font-semibold text-white">Verified Landlord</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Section 1 — Personal Information */}
                        <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 pt-6 pb-4">
                                <SectionHeader
                                    number={1}
                                    icon={User}
                                    title="Personal Information"
                                    subtitle="Your name and login email address"
                                />
                            </div>
                            <div className="px-6 pb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-900">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            {...form.register("fullName")}
                                            className="h-11 text-gray-900 bg-white border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                            placeholder="e.g. John Smith"
                                        />
                                        {form.formState.errors.fullName && (
                                            <p className="text-red-600 text-xs flex items-center gap-1 mt-1">
                                                <AlertCircle className="h-3 w-3" />{form.formState.errors.fullName.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email Address</Label>
                                        <Input
                                            id="email"
                                            {...form.register("email")}
                                            readOnly
                                            className="h-11 bg-white text-gray-500 cursor-not-allowed border-gray-200"
                                        />
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Contact support to change your email
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 — Contact Information */}
                        <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 pt-6 pb-4">
                                <SectionHeader
                                    number={2}
                                    icon={MapPin}
                                    title="Contact Information"
                                    subtitle="Official mailing address used in lease agreements"
                                />
                            </div>
                            <div className="px-6 pb-6">
                                <div className="mb-5 bg-violet-50 border border-violet-200 rounded-xl p-4">
                                    <p className="text-sm text-violet-800">
                                        <strong>Note:</strong> This address will appear on all lease agreements and official tenant correspondence.
                                    </p>
                                </div>
                                <LandlordContactInfoCard
                                    data={{ contactUnit, contactStreetNumber, contactStreetName, contactPoBox, contactCityTown, contactProvince, contactPostalCode }}
                                    errors={contactErrors}
                                    onChange={(field, value) => {
                                        const fieldMap: Record<string, any> = {
                                            contactUnit: 'contactUnit',
                                            contactStreetNumber: 'contactStreetNumber',
                                            contactStreetName: 'contactStreetName',
                                            contactPoBox: 'contactPoBox',
                                            contactCityTown: 'contactCityTown',
                                            contactProvince: 'contactProvince',
                                            contactPostalCode: 'contactPostalCode',
                                        };
                                        const formField = fieldMap[field] as any;
                                        if (formField) {
                                            form.setValue(formField, value);
                                            if (contactErrors[field]) {
                                                setContactErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
                                            }
                                        }
                                    }}
                                    isLoading={loading}
                                />
                            </div>
                        </div>

                        {/* Section 3 — Professional Verification */}
                        <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 pt-6 pb-4">
                                <SectionHeader
                                    number={3}
                                    icon={BadgeCheck}
                                    title="Professional Verification"
                                    subtitle="Tell us your role and upload supporting documents"
                                />
                            </div>
                            <div className="px-6 pb-6 space-y-5">
                                {/* Role Select */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-gray-900">I am a...</Label>
                                    <Select
                                        onValueChange={(val) => form.setValue("userType", val as any)}
                                        defaultValue={form.getValues("userType")}
                                        value={userType}
                                    >
                                        <SelectTrigger className="h-11 bg-white border-gray-200 text-gray-900">
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
                                        <p className="text-red-600 text-xs flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />{form.formState.errors.userType.message}
                                        </p>
                                    )}
                                </div>

                                {/* Realtor License */}
                                {userType === 'realtor' && (
                                    <div className="space-y-5 pt-1">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="licenseNumber" className="text-sm font-semibold text-gray-900">Realtor License Number</Label>
                                            <Input
                                                id="licenseNumber"
                                                placeholder="e.g. RE-12345678"
                                                {...form.register("licenseNumber")}
                                                className="h-11 text-gray-900 bg-white border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-semibold text-gray-900">License Document <span className="font-normal text-gray-400">(Optional)</span></Label>
                                            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                                <span className="text-sm text-gray-600 font-medium">Click to upload license image or PDF</span>
                                                <input type="file" className="hidden" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />
                                                {licenseFile && <span className="text-xs font-semibold text-violet-600 mt-1">{licenseFile.name}</span>}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Government ID */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-gray-900">Government ID <span className="font-normal text-gray-400">(Optional)</span></Label>
                                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                                        <CreditCard className="h-6 w-6 text-gray-400" />
                                        <span className="text-sm text-gray-600 font-medium">Click to upload Government ID</span>
                                        <input type="file" className="hidden" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                                        {idFile && <span className="text-xs font-semibold text-violet-600 mt-1">{idFile.name}</span>}
                                    </label>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        <ShieldCheck className="h-3 w-3" /> Your ID is encrypted and used only for verification purposes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Bar */}
                        <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {verificationStatus ? (
                                    <span className="flex items-center gap-2">
                                        Verification status:
                                        <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                                            verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                                            verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>{verificationStatus.toUpperCase()}</span>
                                    </span>
                                ) : (
                                    <span className="text-gray-400">Not yet submitted</span>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-11 rounded-xl font-semibold shadow-sm"
                            >
                                {loading ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Account Overview */}
                    <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Account Overview</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Signup Role</span>
                                <span className="text-sm font-semibold text-gray-900 capitalize">{systemRole || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                                <span className="text-sm text-gray-500">Joined Date</span>
                                <span className="text-sm font-semibold text-gray-900">{joinedDate || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5">
                                <span className="text-sm text-gray-500">Login Email</span>
                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]" title={user?.email}>
                                    {user?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trust & Security */}
                    <div className="bg-gray-100/80 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">Trust & Security</h2>
                        </div>
                        <div className="p-6 space-y-1">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="h-5 w-5 text-violet-600" />
                                <span className="font-bold text-gray-900">Why Verify?</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">Get a "Verified" badge on your listings</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">Increase tenant trust by 300%</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">Access premium landlord features</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
















