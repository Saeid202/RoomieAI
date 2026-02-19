import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Linkedin, Globe, Mail, Calendar, GripHorizontal, Home, Heart, Briefcase, Users, FileText, DollarSign, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DocumentUploadField } from "@/components/profile/DocumentUploadField";

const profileSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    age: z.coerce.number().min(18, "You must be at least 18 years old").max(120, "Invalid age"),
    email: z.string().email("Invalid email address"),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    nationality: z.string().min(1, "Nationality is required"),
    about_me: z.string().optional(),
    gender: z.enum(["male", "female", "lesbian", "gay", "transgender"], { required_error: "Gender is required" }),
    prefer_not_to_say: z.string().optional(),
    phone: z.string().optional(),
    profile_visibility: z.enum(["public", "private"], { required_error: "Profile visibility is required" }),
    language: z.string().optional(),
    ethnicity: z.string().optional(),
    religion: z.string().optional(),
    occupation: z.string().optional(),
    preferred_location: z.string().optional(),
    budget_range: z.string().optional(),
    move_in_date_start: z.string().optional(),
    move_in_date_end: z.string().optional(),
    housing_type: z.enum(["share room", "private room", "studio", "one bed condo", "two bed condo", "house"]).optional(),
    work_location_legacy: z.string().optional(),
    pet_preference: z.string().optional(),
    diet: z.string().optional(),
    diet_other: z.string().optional(),
    hobbies: z.array(z.string()).optional(),
    living_space: z.string().optional(),
    work_schedule: z.enum(["day shift", "evening shift", "night shift"]).optional(),
    work_location: z.enum(["remote", "go to office"]).optional(),
    has_pets: z.boolean().optional(),
    pet_type: z.string().optional(),
    smoking: z.enum(["Yes", "No"]).optional(),
    lives_with_smokers: z.enum(["yes", "no"]).optional(),
    // New fields for Phase 1
    monthly_income: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SeekerProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState<string>('tenant'); // Default to tenant
    
    // State for document URLs
    const [documentUrls, setDocumentUrls] = useState({
        reference_letters: null as string | null,
        employment_letter: null as string | null,
        credit_score_report: null as string | null,
        additional_documents: null as string | null,
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            age: 18,
            email: "",
            linkedin: "",
            nationality: "",
            about_me: "",
            gender: undefined,
            prefer_not_to_say: "",
            phone: "",
            profile_visibility: "public",
            language: "",
            ethnicity: "",
            religion: "",
            occupation: "",
            preferred_location: "",
            budget_range: "",
            move_in_date_start: "",
            move_in_date_end: "",
            housing_type: undefined,
            work_location_legacy: "",
            pet_preference: "",
            diet: "",
            diet_other: "",
            hobbies: [],
            living_space: "",
            work_schedule: undefined,
            work_location: undefined,
            has_pets: false,
            pet_type: "",
            smoking: "No",
            lives_with_smokers: "no",
            // New fields for Phase 1
            monthly_income: "",
            emergency_contact_name: "",
            emergency_contact_phone: "",
            emergency_contact_relationship: "",
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                setLoading(true);
                console.log("Fetching profile for user:", user.id);

                // 1. Fetch from user_profiles table (common fields)
                const { data: userProfile, error: userError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (userError && userError.code !== 'PGRST116') {
                    console.error("Error fetching user_profiles:", userError);
                }

                // 2. Fetch from tenant_profiles table (tenant-specific fields)
                const { data: tenantProfile, error: tenantError } = await supabase
                    .from('tenant_profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (tenantError && tenantError.code !== 'PGRST116') {
                    console.error("Error fetching tenant_profiles:", tenantError);
                }

                console.log("User profile data:", userProfile);
                console.log("Tenant profile data:", tenantProfile);

                // Set user_type if available
                if (userProfile?.user_type) {
                    setUserType(userProfile.user_type);
                }

                // Set document URLs from tenant profile
                if (tenantProfile) {
                    setDocumentUrls({
                        reference_letters: tenantProfile.reference_letters || null,
                        employment_letter: tenantProfile.employment_letter || null,
                        credit_score_report: tenantProfile.credit_score_report || null,
                        additional_documents: tenantProfile.additional_documents || null,
                    });
                }

                // 3. Merge data from both tables
                const defaultValues: Partial<ProfileFormValues> = {
                    // From user_profiles (common fields)
                    full_name: userProfile?.full_name || user.user_metadata?.full_name || "",
                    age: userProfile?.age || 18,
                    email: userProfile?.email || user.email || "",
                    phone: userProfile?.phone || "",
                    nationality: userProfile?.nationality || "",
                    language: userProfile?.language || "",
                    ethnicity: userProfile?.ethnicity || "",
                    religion: userProfile?.religion || "",
                    occupation: userProfile?.occupation || "",
                    gender: userProfile?.gender || undefined,
                    
                    // From tenant_profiles (tenant-specific fields)
                    linkedin: tenantProfile?.linkedin || "",
                    about_me: tenantProfile?.about_me || "",
                    prefer_not_to_say: tenantProfile?.prefer_not_to_say || "",
                    profile_visibility: tenantProfile?.profile_visibility || "public",
                    preferred_location: tenantProfile?.preferred_location || "",
                    budget_range: tenantProfile?.budget_range || "",
                    move_in_date_start: tenantProfile?.move_in_date_start || "",
                    move_in_date_end: tenantProfile?.move_in_date_end || "",
                    housing_type: tenantProfile?.housing_type || undefined,
                    living_space: tenantProfile?.living_space || "",
                    work_location: tenantProfile?.work_location || undefined,
                    work_location_legacy: tenantProfile?.work_location_legacy || "",
                    work_schedule: tenantProfile?.work_schedule || undefined,
                    pet_preference: tenantProfile?.pet_preference || "",
                    has_pets: tenantProfile?.has_pets || false,
                    pet_type: tenantProfile?.pet_type || "",
                    smoking: tenantProfile?.smoking || "No",
                    lives_with_smokers: tenantProfile?.lives_with_smokers || "no",
                    diet: tenantProfile?.diet || "",
                    diet_other: tenantProfile?.diet_other || "",
                    hobbies: tenantProfile?.hobbies || [],
                    // New Phase 1 fields
                    monthly_income: tenantProfile?.monthly_income?.toString() || "",
                    emergency_contact_name: tenantProfile?.emergency_contact_name || "",
                    emergency_contact_phone: tenantProfile?.emergency_contact_phone || "",
                    emergency_contact_relationship: tenantProfile?.emergency_contact_relationship || "",
                };

                console.log("Merged default values:", defaultValues);
                form.reset(defaultValues as ProfileFormValues);
            } catch (err) {
                console.error("Unexpected error:", err);
                toast({
                    title: "Error loading profile",
                    description: "Could not load your profile data.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, form, toast]);

    const onSubmit = async (values: ProfileFormValues) => {
        if (!user) return;

        try {
            console.log("Saving profile for user:", user.id, values);

            // 1. Save COMMON fields to user_profiles
            const commonFields = {
                id: user.id,
                full_name: values.full_name,
                age: values.age,
                email: values.email,
                phone: values.phone,
                nationality: values.nationality,
                language: values.language,
                ethnicity: values.ethnicity,
                religion: values.religion,
                occupation: values.occupation,
                gender: values.gender,
                user_type: userType,
                updated_at: new Date().toISOString(),
            };

            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert(commonFields);

            if (profileError) {
                console.error("Error saving to user_profiles:", profileError);
                throw profileError;
            }

            // 2. Save TENANT-SPECIFIC fields to tenant_profiles
            const tenantFields = {
                user_id: user.id,
                linkedin: values.linkedin || null,
                about_me: values.about_me || null,
                prefer_not_to_say: values.prefer_not_to_say || null,
                profile_visibility: values.profile_visibility || 'public',
                preferred_location: values.preferred_location || null,
                budget_range: values.budget_range || null,
                move_in_date_start: values.move_in_date_start || null,
                move_in_date_end: values.move_in_date_end || null,
                housing_type: values.housing_type || null,
                living_space: values.living_space || null,
                work_location: values.work_location || null,
                work_location_legacy: values.work_location_legacy || null,
                work_schedule: values.work_schedule || null,
                pet_preference: values.pet_preference || null,
                has_pets: values.has_pets || false,
                pet_type: values.pet_type || null,
                smoking: values.smoking || null,
                lives_with_smokers: values.lives_with_smokers || null,
                diet: values.diet || null,
                diet_other: values.diet_other || null,
                hobbies: values.hobbies || [],
                // New Phase 1 fields
                monthly_income: values.monthly_income ? parseFloat(values.monthly_income) : null,
                emergency_contact_name: values.emergency_contact_name || null,
                emergency_contact_phone: values.emergency_contact_phone || null,
                emergency_contact_relationship: values.emergency_contact_relationship || null,
                updated_at: new Date().toISOString(),
            };

            const { error: tenantError } = await supabase
                .from('tenant_profiles')
                .upsert(tenantFields);

            if (tenantError) {
                console.error("Error saving to tenant_profiles:", tenantError);
                throw tenantError;
            }

            console.log("Profile saved successfully to both tables");

            toast({
                title: "Profile updated",
                description: "Your profile has been saved successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to save profile. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                <Skeleton className="h-12 w-1/3" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-5xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                    <p className="text-lg text-slate-600">Complete your profile to find the perfect match</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {/* Basic Information Section */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="John Doe" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Age</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input type="number" className="pl-10 h-12 text-base" placeholder="25" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base bg-slate-50" {...field} readOnly />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Your email is managed through account settings
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Phone Number</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="+1 (555) 123-4567" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="linkedin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Linkedin className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                <Input className="pl-10 h-12 text-base" placeholder="https://linkedin.com/in/username" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="about_me"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">About Me</FormLabel>
                                        <FormControl>
                                            <Textarea className="min-h-[120px] text-base" placeholder="Tell us a bit about yourself..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </CardContent>
                        </Card>

                        {/* Demographics Section */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Demographics</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="lesbian">Lesbian</SelectItem>
                                                    <SelectItem value="gay">Gay</SelectItem>
                                                    <SelectItem value="transgender">Transgender</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="profile_visibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Profile Visibility</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="public">Public (Everybody)</SelectItem>
                                                    <SelectItem value="private">Private</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Nationality</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="United States" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Language</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="English" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="ethnicity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Ethnicity</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Your ethnicity" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="religion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Religion</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Your religion" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Occupation</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 text-base" placeholder="Your occupation" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </CardContent>
                        </Card>

                        {/* Housing Preferences Section */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Home className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Housing Preferences</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="preferred_location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Preferred Location (up to 5)</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="New York, Los Angeles, Chicago" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="budget_range"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Budget Range</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="$500 - $1500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="move_in_date_start"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Move-in Date Start</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="move_in_date_end"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Move-in Date End</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="housing_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Housing Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select housing type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="share room">Share Room</SelectItem>
                                                    <SelectItem value="private room">Private Room</SelectItem>
                                                    <SelectItem value="studio">Studio</SelectItem>
                                                    <SelectItem value="one bed condo">One Bed Condo</SelectItem>
                                                    <SelectItem value="two bed condo">Two Bed Condo</SelectItem>
                                                    <SelectItem value="house">House</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="living_space"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Living Space Preference</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Your living space preferences" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            </CardContent>
                        </Card>

                        {/* Lifestyle Section */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Heart className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Lifestyle & Preferences</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="smoking"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Do You Smoke?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Yes">Yes</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lives_with_smokers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Can Live with Smokers?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="yes">Yes</SelectItem>
                                                    <SelectItem value="no">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="has_pets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Do You Have Pets?</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="true">Yes</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pet_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Pet Type</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Dog, cat, bird" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="pet_preference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Pet Preference</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 text-base" placeholder="Dogs, cats, no pets" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="diet"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Diet</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Vegetarian, vegan, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="diet_other"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Other Dietary Restrictions</FormLabel>
                                            <FormControl>
                                                <Input className="h-12 text-base" placeholder="Other dietary restrictions" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="hobbies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Hobbies & Interests</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 text-base" placeholder="Reading, hiking, cooking" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </CardContent>
                        </Card>

                        {/* Work Information Section */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Work Information</h2>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="work_location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Work Location</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select work location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="remote">Remote</SelectItem>
                                                    <SelectItem value="go to office">Go to Office</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="work_schedule"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Work Schedule</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-base">
                                                        <SelectValue placeholder="Select schedule" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="day shift">Day Shift</SelectItem>
                                                    <SelectItem value="evening shift">Evening Shift</SelectItem>
                                                    <SelectItem value="night shift">Night Shift</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="work_location_legacy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">Work Location Address</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 text-base" placeholder="Current work location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            </CardContent>
                        </Card>

                        {/* NEW SECTION - Documents & Financial Information */}
                        <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-white" />
                                    <h2 className="text-2xl font-bold text-white">Documents & Financial Information</h2>
                                </div>
                                <p className="text-indigo-100 text-sm mt-1">
                                    Upload your documents once and use them for all applications
                                </p>
                            </div>
                            <CardContent className="p-6 space-y-6">

                            {/* Financial & Emergency Contact - Compact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Monthly Income */}
                                <FormField
                                    control={form.control}
                                    name="monthly_income"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Monthly Income</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input 
                                                        type="number" 
                                                        className="pl-10 h-12 text-base" 
                                                        placeholder="5000" 
                                                        {...field} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Emergency Contact Name */}
                                <FormField
                                    control={form.control}
                                    name="emergency_contact_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Emergency Contact Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="John Doe" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Emergency Contact Phone */}
                                <FormField
                                    control={form.control}
                                    name="emergency_contact_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Emergency Contact Phone</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="+1 (555) 123-4567" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Emergency Contact Relationship */}
                                <FormField
                                    control={form.control}
                                    name="emergency_contact_relationship"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">Emergency Contact Relationship</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-4 h-5 w-5 text-slate-400" />
                                                    <Input className="pl-10 h-12 text-base" placeholder="Parent, Sibling, Friend" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Document Uploads */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Required Documents</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Upload these documents to speed up your rental applications
                                    </p>
                                </div>

                                {user && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <DocumentUploadField
                                            label="Reference Letters"
                                            description="Letters from previous landlords or employers"
                                            documentType="reference_letters"
                                            userId={user.id}
                                            existingFileUrl={documentUrls.reference_letters}
                                            onUploadSuccess={(url) => setDocumentUrls(prev => ({ ...prev, reference_letters: url }))}
                                            onDeleteSuccess={() => setDocumentUrls(prev => ({ ...prev, reference_letters: null }))}
                                        />

                                        <DocumentUploadField
                                            label="Employment Letter"
                                            description="Proof of employment and income"
                                            documentType="employment_letter"
                                            userId={user.id}
                                            existingFileUrl={documentUrls.employment_letter}
                                            onUploadSuccess={(url) => setDocumentUrls(prev => ({ ...prev, employment_letter: url }))}
                                            onDeleteSuccess={() => setDocumentUrls(prev => ({ ...prev, employment_letter: null }))}
                                        />

                                        <DocumentUploadField
                                            label="Credit Score Report"
                                            description="Recent credit report or score"
                                            documentType="credit_score_report"
                                            userId={user.id}
                                            existingFileUrl={documentUrls.credit_score_report}
                                            onUploadSuccess={(url) => setDocumentUrls(prev => ({ ...prev, credit_score_report: url }))}
                                            onDeleteSuccess={() => setDocumentUrls(prev => ({ ...prev, credit_score_report: null }))}
                                        />

                                        <DocumentUploadField
                                            label="Additional Documents"
                                            description="Any other supporting documents"
                                            documentType="additional_documents"
                                            userId={user.id}
                                            existingFileUrl={documentUrls.additional_documents}
                                            onUploadSuccess={(url) => setDocumentUrls(prev => ({ ...prev, additional_documents: url }))}
                                            onDeleteSuccess={() => setDocumentUrls(prev => ({ ...prev, additional_documents: null }))}
                                        />
                                    </div>
                                )}
                            </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-start pt-4">
                            <Button 
                                type="submit" 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-12 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
