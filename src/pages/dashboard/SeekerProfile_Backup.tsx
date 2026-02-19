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
import { User, Linkedin, Globe, Mail, Calendar, GripHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
    profile_visibility: z.enum(["everybody", "same gender"], { required_error: "Profile visibility is required" }),
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
    hobbies: z.string().optional(),
    work_schedule: z.enum(["day shift", "evening shift", "night shift"]).optional(),
    work_location: z.enum(["remote", "go to office"]).optional(),
    has_pets: z.boolean().optional(),
    pet_type: z.string().optional(),
    smoking: z.enum(["Yes", "No"]).optional(),
    lives_with_smokers: z.enum(["yes", "no"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SeekerProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState<string>('tenant'); // Default to tenant

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
            profile_visibility: "everybody",
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
            hobbies: "",
            work_schedule: undefined,
            work_location: undefined,
            has_pets: false,
            pet_type: "",
            smoking: "No",
            lives_with_smokers: "no",
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                setLoading(true);
                console.log("Fetching profile for user:", user.id);

                // 1. Fetch from user_profiles table
                const { data: fetchedData, error } = await supabase
                    .from('user_profiles')
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

                // Merge data: user_profiles Table > Auth Metadata
                if (profile) {
                    defaultValues = {
                        full_name: profile.full_name || metaName,
                        age: profile.age || 18,
                        email: profile.email || user.email || "", // Email usually shouldn't change, but allow user to edit contact email?
                        linkedin: profile.linkedin || "",
                        nationality: profile.nationality || "",
                        about_me: profile.about_me || "",
                    };
                } else {
                    // Start fresh with metadata
                    defaultValues = {
                        full_name: metaName,
                        age: 18,
                        email: user.email || "",
                        linkedin: "",
                        nationality: "",
                        about_me: "",
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
                full_name: values.full_name,
                age: values.age,
                email: values.email,
                linkedin: values.linkedin,
                nationality: values.nationality,
                about_me: values.about_me,
                user_type: userType,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('user_profiles')
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
        <div className="p-4 md:p-8 max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Profile</h1>
                <p className="text-slate-600 mt-2">Manage your personal information and public profile details.</p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        This information will be used to verify your identity and help you find matches.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="John Doe" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="age"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Age</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input type="number" className="pl-9" placeholder="25" {...field} />
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
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9 bg-slate-50" {...field} readOnly />
                                                </div>
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
                                    name="linkedin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="https://linkedin.com/in/username" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="about_me"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>About Me</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <GripHorizontal className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Textarea className="pl-9 min-h-[120px]" placeholder="Tell us a bit about yourself..." {...field} />
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
                                                    <SelectItem value="transgender">Transgender</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="+1 (555) 123-4567" {...field} />
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
                                    name="profile_visibility"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profile Visibility</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="everybody">Everybody</SelectItem>
                                                    <SelectItem value="same gender">Same Gender</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nationality</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="United States" {...field} />
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
                                    name="language"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Language</FormLabel>
                                            <FormControl>
                                                <Input placeholder="English" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ethnicity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ethnicity</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your ethnicity" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="religion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Religion</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your religion" {...field} />
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
                                                <Input placeholder="Your occupation" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="preferred_location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preferred Location (up to 5)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York, Los Angeles, Chicago" {...field} />
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
                                            <FormLabel>Budget Range</FormLabel>
                                            <FormControl>
                                                <Input placeholder="$500 - $1500" {...field} />
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
                                            <FormLabel>Move-in Date Start</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
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
                                            <FormLabel>Move-in Date End</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
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
                                            <FormLabel>Housing Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                    name="work_location_legacy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Location (Legacy)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Current work location" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="pet_preference"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pet Preference</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dogs, cats, no pets" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="diet"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Diet</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vegetarian, vegan, etc." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="hobbies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hobbies</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Reading, hiking, cooking" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="work_schedule"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Schedule</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="work_location"
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
                                    name="has_pets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Has Pets</FormLabel>
                                            <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="pet_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pet Type</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dog, cat, bird" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="smoking"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Smoking</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="lives_with_smokers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lives with Smokers</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                <FormField
                                    control={form.control}
                                    name="diet_other"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Diet Other</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Other dietary restrictions" {...field} />
                                            </FormControl>
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
                                            <div className="relative">
                                                <GripHorizontal className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <Textarea className="pl-9 min-h-[120px]" placeholder="Tell us a bit about yourself..." {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="bg-roomie-purple hover:bg-roomie-purple/90 min-w-[140px]" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
