import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
// import { useKYCVerification } from "@/hooks/useKYCVerification";
// import { kycService } from "@/services/kycService";
// import { VerificationConsent } from "@/components/verification/VerificationConsent";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { User, Linkedin, Globe, Mail, Calendar, GripHorizontal, Phone, Home, Utensils, Briefcase, Heart, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Constants for form options
const NATIONALITIES = ["American", "Canadian", "British", "Australian", "German", "French", "Italian", "Spanish", "Japanese", "Chinese", "Indian", "Brazilian", "Mexican", "Iranian", "Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Arabic", "Hindi", "Russian", "Farsi", "Other"];
const ETHNICITIES = ["White/Caucasian", "Black/African American", "Hispanic/Latino", "Asian", "Native American", "Middle Eastern", "Mixed/Multiracial", "Other", "Prefer not to say"];
const RELIGIONS = ["Christianity", "Islam", "Judaism", "Hinduism", "Buddhism", "Sikhism", "Atheist", "Agnostic", "Other", "Prefer not to say"];
const HOBBIES_LIST = ["Reading", "Gaming", "Cooking", "Hiking", "Movies", "Music", "Art", "Sports", "Photography", "Yoga", "Crafting", "Gardening", "Writing", "Dancing", "Meditation"];

const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    age: z.coerce.number().min(18, "You must be at least 18 years old").max(120, "Invalid age"),
    email: z.string().email("Invalid email address"),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    nationality: z.string().min(1, "Nationality is required"),
    about_me: z.string().optional(),
    
    // Additional About Me fields
    fullName: z.string().min(1, "Full name is required"),
    gender: z.enum(["male", "female", "lesbian", "gay", "bisexual", "transgender", "non-binary", "prefer-not-to-say"]),
    phoneNumber: z.string().optional(),
    profileVisibility: z.array(z.string()).optional(),
    linkedinProfile: z.string().url().optional().or(z.literal("")),
    language: z.string().optional(),
    ethnicity: z.string().optional(),
    religion: z.string().optional(),
    occupation: z.string().optional(),
    preferredLocation: z.array(z.string()).optional(),
    budgetRange: z.tuple([z.number(), z.number()]),
    moveInDateStart: z.date(),
    housingType: z.enum(["apartment", "house"]),
    livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"]),
    smoking: z.boolean(),
    livesWithSmokers: z.boolean(),
    hasPets: z.boolean(),
    workLocation: z.enum(["remote", "office", "hybrid"]),
    workSchedule: z.enum(["dayShift", "afternoonShift", "overnightShift"]),
    hobbies: z.array(z.string()).optional(),
    diet: z.enum(["vegetarian", "halal", "kosher", "noPreference", "other"]),
    dietOther: z.string().optional(),
    genderPreference: z.array(z.string()).optional(),
    nationalityPreference: z.enum(["noPreference", "same", "different"]),
    languagePreference: z.enum(["noPreference", "same", "different"]),
    ethnicityPreference: z.enum(["noPreference", "same", "different"]),
    religionPreference: z.enum(["noPreference", "same", "different"]),
    occupationPreference: z.boolean(),
    workSchedulePreference: z.enum(["noPreference", "same", "different"]),
    roommateHobbies: z.array(z.string()).optional(),
    rentOption: z.enum(["findTogether", "findSeparate"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SeekerProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    // KYC Verification hook - temporarily disabled
    // const { 
    //     status: kycStatus, 
    //     loading: kycLoading, 
    //     error: kycError, 
    //     isStarting, 
    //     canStartVerification, 
    //     startVerification, 
    //     refreshStatus 
    // } = useKYCVerification();
    
    // Consent state - temporarily disabled
    // const [hasConsent, setHasConsent] = useState(false);
    const [userType, setUserType] = useState<string>('tenant'); // Default to tenant

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            age: 18,
            email: "",
            linkedin: "",
            nationality: "",
            about_me: "",
            
            // Additional About Me fields
            fullName: "",
            gender: "prefer-not-to-say",
            phoneNumber: "",
            profileVisibility: [],
            linkedinProfile: "",
            language: "",
            ethnicity: "",
            religion: "",
            occupation: "",
            preferredLocation: [],
            budgetRange: [800, 1500],
            moveInDateStart: new Date(),
            housingType: "apartment",
            livingSpace: "privateRoom",
            smoking: false,
            livesWithSmokers: false,
            hasPets: false,
            workLocation: "remote",
            workSchedule: "dayShift",
            hobbies: [],
            diet: "noPreference",
            dietOther: "",
            genderPreference: [],
            nationalityPreference: "noPreference",
            languagePreference: "noPreference",
            ethnicityPreference: "noPreference",
            religionPreference: "noPreference",
            occupationPreference: false,
            workSchedulePreference: "noPreference",
            roommateHobbies: [],
            rentOption: "findTogether",
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                setLoading(true);
                console.log("Fetching profile for user:", user.id);

                // 1. Fetch from profiles table
                const { data: fetchedData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                const profile = fetchedData as any;

                if (profile?.user_type) {
                    setUserType(profile.user_type);
                }

                if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
                    console.error("Error fetching profile:", error);
                    toast({
                        title: "Error fetching profile",
                        description: "Could not load your profile data.",
                        variant: "destructive",
                    });
                }

                console.log("Profile data from DB:", profile);

                // 2. Prepare default values
                let defaultValues: Partial<ProfileFormValues> = {
                    email: user.email || "",
                };

                // Split name from metadata if available
                const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
                let metaFirstName = "";
                let metaLastName = "";
                if (metaName) {
                    const parts = metaName.trim().split(" ");
                    if (parts.length > 0) metaFirstName = parts[0];
                    if (parts.length > 1) metaLastName = parts.slice(1).join(" ");
                }

                // Merge data: Profile Table > Auth Metadata
                if (profile) {
                    defaultValues = {
                        first_name: profile.first_name || metaFirstName,
                        last_name: profile.last_name || metaLastName,
                        age: profile.age || 18,
                        email: profile.email || user.email || "",
                        linkedin: profile.linkedin || "",
                        nationality: profile.nationality || "",
                        about_me: profile.about_me || "",
                        
                        // Additional About Me fields
                        fullName: profile.full_name || metaName || "",
                        gender: profile.gender || "prefer-not-to-say",
                        phoneNumber: profile.phone_number || "",
                        profileVisibility: profile.profile_visibility || [],
                        linkedinProfile: profile.linkedin_profile || "",
                        language: profile.language || "",
                        ethnicity: profile.ethnicity || "",
                        religion: profile.religion || "",
                        occupation: profile.occupation || "",
                        preferredLocation: profile.preferred_location || [],
                        budgetRange: profile.budget_range || [800, 1500],
                        moveInDateStart: profile.move_in_date_start ? new Date(profile.move_in_date_start) : new Date(),
                        housingType: profile.housing_type || "apartment",
                        livingSpace: profile.living_space || "privateRoom",
                        smoking: profile.smoking || false,
                        livesWithSmokers: profile.lives_with_smokers || false,
                        hasPets: profile.has_pets || false,
                        workLocation: profile.work_location || "remote",
                        workSchedule: profile.work_schedule || "dayShift",
                        hobbies: profile.hobbies || [],
                        diet: profile.diet || "noPreference",
                        dietOther: profile.diet_other || "",
                        genderPreference: profile.gender_preference || [],
                        nationalityPreference: profile.nationality_preference || "noPreference",
                        languagePreference: profile.language_preference || "noPreference",
                        ethnicityPreference: profile.ethnicity_preference || "noPreference",
                        religionPreference: profile.religion_preference || "noPreference",
                        occupationPreference: profile.occupation_preference || false,
                        workSchedulePreference: profile.work_schedule_preference || "noPreference",
                        roommateHobbies: profile.roommate_hobbies || [],
                        rentOption: profile.rent_option || "findTogether",
                    };
                } else {
                    // Start fresh with metadata
                    defaultValues = {
                        first_name: metaFirstName,
                        last_name: metaLastName,
                        age: 18,
                        email: user.email || "",
                        linkedin: "",
                        nationality: "",
                        about_me: "",
                        
                        // Additional About Me fields
                        fullName: metaName || "",
                        gender: "prefer-not-to-say",
                        phoneNumber: "",
                        profileVisibility: [],
                        linkedinProfile: "",
                        language: "",
                        ethnicity: "",
                        religion: "",
                        occupation: "",
                        preferredLocation: [],
                        budgetRange: [800, 1500],
                        moveInDateStart: new Date(),
                        housingType: "apartment",
                        livingSpace: "privateRoom",
                        smoking: false,
                        livesWithSmokers: false,
                        hasPets: false,
                        workLocation: "remote",
                        workSchedule: "dayShift",
                        hobbies: [],
                        diet: "noPreference",
                        dietOther: "",
                        genderPreference: [],
                        nationalityPreference: "noPreference",
                        languagePreference: "noPreference",
                        ethnicityPreference: "noPreference",
                        religionPreference: "noPreference",
                        occupationPreference: false,
                        workSchedulePreference: "noPreference",
                        roommateHobbies: [],
                        rentOption: "findTogether",
                    };
                }

                form.reset(defaultValues as ProfileFormValues);
            } catch (err) {
                console.error("Unexpected error:", err);
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

            // Construct payload
            const updates = {
                id: user.id,
                first_name: values.first_name,
                last_name: values.last_name,
                full_name: values.fullName || `${values.first_name} ${values.last_name}`.trim(),
                age: values.age,
                email: values.email,
                linkedin: values.linkedin,
                nationality: values.nationality,
                about_me: values.about_me,
                user_type: userType,
                updated_at: new Date().toISOString(),
                
                // Additional About Me fields
                gender: values.gender,
                phone_number: values.phoneNumber,
                profile_visibility: values.profileVisibility,
                linkedin_profile: values.linkedinProfile,
                language: values.language,
                ethnicity: values.ethnicity,
                religion: values.religion,
                occupation: values.occupation,
                preferred_location: values.preferredLocation,
                budget_range: values.budgetRange,
                move_in_date_start: values.moveInDateStart,
                housing_type: values.housingType,
                living_space: values.livingSpace,
                smoking: values.smoking,
                lives_with_smokers: values.livesWithSmokers,
                has_pets: values.hasPets,
                work_location: values.workLocation,
                work_schedule: values.workSchedule,
                hobbies: values.hobbies,
                diet: values.diet,
                diet_other: values.dietOther,
                gender_preference: values.genderPreference,
                nationality_preference: values.nationalityPreference,
                language_preference: values.languagePreference,
                ethnicity_preference: values.ethnicityPreference,
                religion_preference: values.religionPreference,
                occupation_preference: values.occupationPreference,
                work_schedule_preference: values.workSchedulePreference,
                roommate_hobbies: values.roommateHobbies,
                rent_option: values.rentOption,
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

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
                <div className="text-center">
                    <h2>Loading profile...</h2>
                    <p>Please wait while we fetch your information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Compact Header Section */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-3">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-base text-slate-600 max-w-2xl mx-auto mb-3">
                        Build your comprehensive profile to find your perfect roommate match.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-500">Live updates saved automatically</span>
                    </div>
                </div>

                <div className="flex">
                    {/* Left Side - Form */}
                    <div className="flex-1 lg:max-w-4xl border-r-2 border-purple-200">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-8 text-left pl-6">
                {/* Personal Information Section */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            Personal Information
                        </CardTitle>
                        <CardDescription className="text-purple-700 font-medium">
                            Basic information about you and your identity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="25" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="lesbian">Lesbian</SelectItem>
                                                <SelectItem value="gay">Gay</SelectItem>
                                                <SelectItem value="bisexual">Bisexual</SelectItem>
                                                <SelectItem value="transgender">Transgender</SelectItem>
                                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 (555) 123-4567" {...field} />
                                        </FormControl>
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
                                        <FormLabel>Nationality</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select nationality" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {NATIONALITIES.map((nat) => (
                                                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Primary Language</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {LANGUAGES.map((lang) => (
                                                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="about_me"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>About Me</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            className="min-h-[120px]" 
                                            placeholder="Tell us a bit about yourself..." 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Contact & Professional Section */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact & Professional
                        </CardTitle>
                        <CardDescription>
                            Your contact information and professional details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input className="bg-slate-50" {...field} readOnly />
                                    </FormControl>
                                    <FormDescription>
                                        Your email address is managed through your account settings.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profileVisibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Visibility</FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {["Public", "Private", "Friends Only", "Matches Only"].map((option) => (
                                                <div key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <Checkbox
                                                        checked={field.value?.includes(option)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, option])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== option
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                    <FormLabel className="text-sm font-normal">
                                                        {option}
                                                    </FormLabel>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="linkedin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>LinkedIn Profile</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="workLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Work Location</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select work location" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="remote">Work from home</SelectItem>
                                                <SelectItem value="office">Go to office</SelectItem>
                                                <SelectItem value="hybrid">Hybrid (both)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="workSchedule"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Work Schedule</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select work schedule" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="dayShift">Day shift</SelectItem>
                                                <SelectItem value="afternoonShift">Afternoon shift</SelectItem>
                                                <SelectItem value="overnightShift">Overnight shift</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Identity Verification Section - Temporarily Disabled */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            Identity Verification
                        </CardTitle>
                        <CardDescription className="text-purple-700 font-medium">
                            Verify your identity to build trust and unlock premium features
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="text-center py-8">
                            <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
                            <span className="text-purple-600">Verification section temporarily disabled</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Lifestyle & Preferences Section */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Lifestyle & Preferences
                        </CardTitle>
                        <CardDescription>
                            Your lifestyle habits and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="diet"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dietary Preferences</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select diet" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="noPreference">No restrictions</SelectItem>
                                                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                                <SelectItem value="halal">Halal only</SelectItem>
                                                <SelectItem value="kosher">Kosher only</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="religion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Religion</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select religion" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {RELIGIONS.map((rel) => (
                                                    <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                                                ))}
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
                                name="ethnicity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ethnicity</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ethnicity" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ETHNICITIES.map((eth) => (
                                                    <SelectItem key={eth} value={eth}>{eth}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dietOther"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Other Dietary Requirements</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Specify other dietary needs" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="smoking"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Smoking</FormLabel>
                                                <FormDescription className="text-sm">
                                                    Do you smoke?
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="livesWithSmokers"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Live with Smokers</FormLabel>
                                                <FormDescription className="text-sm">
                                                    Comfortable living with smokers?
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hasPets"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Have Pets</FormLabel>
                                                <FormDescription className="text-sm">
                                                    Do you have any pets?
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Housing Preferences Section */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            Housing Preferences
                        </CardTitle>
                        <CardDescription>
                            Your ideal living situation and requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="preferredLocation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Locations</FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {["Downtown", "Suburbs", "University Area", "City Center", "Near Transit", "Quiet Neighborhood"].map((location) => (
                                                <div key={location} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <Checkbox
                                                        checked={field.value?.includes(location)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, location])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== location
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                    <FormLabel className="text-sm font-normal">
                                                        {location}
                                                    </FormLabel>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="housingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Housing Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select housing type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="apartment">Apartment</SelectItem>
                                                <SelectItem value="house">House</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="livingSpace"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Living Space</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select living space" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="privateRoom">Private Room</SelectItem>
                                                <SelectItem value="sharedRoom">Shared Room</SelectItem>
                                                <SelectItem value="entirePlace">Entire Place</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="budgetRange"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget Range ($/month)</FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                type="number" 
                                                placeholder="Min" 
                                                value={field.value[0]}
                                                onChange={(e) => field.onChange([parseInt(e.target.value) || 0, field.value[1]])}
                                            />
                                            <Input 
                                                type="number" 
                                                placeholder="Max" 
                                                value={field.value[1]}
                                                onChange={(e) => field.onChange([field.value[0], parseInt(e.target.value) || 0])}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="hobbies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hobbies & Interests</FormLabel>
                                    <FormControl>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {HOBBIES_LIST.map((hobby) => (
                                                <div key={hobby} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <Checkbox
                                                        checked={field.value?.includes(hobby)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, hobby])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== hobby
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                    <FormLabel className="text-sm font-normal">
                                                        {hobby}
                                                    </FormLabel>
                                                </div>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-8">
                    <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] text-lg" 
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                Saving Profile...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Complete Profile
                            </span>
                        )}
                    </Button>
                </div>
                        </div>
                    </form>
                </Form>
                    </div>

                    {/* Right Side - Progress & Tips */}
                    <div className="lg:w-80 space-y-6">
                        {/* Profile Completion Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="text-lg font-bold text-purple-900">
                                    Profile Completion
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-600">Overall Progress</span>
                                        <span className="text-sm font-bold text-purple-600">75%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{width: '75%'}}></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Complete all sections to unlock premium matching features
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <CardTitle className="text-lg font-bold text-purple-900">
                                    💡 Pro Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-green-600 text-xs font-bold">✓</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Add photos to increase matches</p>
                                            <p className="text-xs text-slate-500">Profiles with photos get 3x more views</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-blue-600 text-xs font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Be specific in preferences</p>
                                            <p className="text-xs text-slate-500">Detailed info helps AI matching</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-purple-600 text-xs font-bold">★</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">Complete all sections</p>
                                            <p className="text-xs text-slate-500">Unlock premium roommate features</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
