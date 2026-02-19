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
    const [userType, setUserType] = useState<string>('tenant');

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

                const { data: fetchedData, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                const profile = fetchedData as any;

                if (profile?.user_type) {
                    setUserType(profile.user_type);
                }

                console.log("Profile data from DB:", profile);

                let defaultValues: Partial<ProfileFormValues> = {
                    email: user.email || "",
                };

                if (profile) {
                    defaultValues = {
                        full_name: profile.full_name || "",
                        age: profile.age || 18,
                        email: profile.email || user.email || "",
                        linkedin: profile.linkedin || "",
                        nationality: profile.nationality || "",
                        about_me: profile.about_me || "",
                        gender: profile.gender || undefined,
                        phone: profile.phone || "",
                        profile_visibility: profile.profile_visibility || "everybody",
                        language: profile.language || "",
                        ethnicity: profile.ethnicity || "",
                        religion: profile.religion || "",
                        occupation: profile.occupation || "",
                        preferred_location: profile.preferred_location || "",
                        budget_range: profile.budget_range || "",
                        move_in_date_start: profile.move_in_date_start || "",
                        move_in_date_end: profile.move_in_date_end || "",
                        housing_type: profile.housing_type || undefined,
                        work_location_legacy: profile.work_location_legacy || "",
                        pet_preference: profile.pet_preference || "",
                        diet: profile.diet || "",
                        diet_other: profile.diet_other || "",
                        hobbies: profile.hobbies || "",
                        work_schedule: profile.work_schedule || undefined,
                        work_location: profile.work_location || undefined,
                        has_pets: profile.has_pets || false,
                        pet_type: profile.pet_type || "",
                        smoking: profile.smoking || "No",
                        lives_with_smokers: profile.lives_with_smokers || "no",
                    };
                } else {
                    defaultValues = {
                        full_name: "",
                        age: 18,
                        email: user.email || "",
                        linkedin: "",
                        nationality: "",
                        about_me: "",
                        gender: undefined,
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

            const updates = {
                id: user.id,
                full_name: values.full_name,
                age: values.age,
                email: values.email,
                linkedin: values.linkedin,
                nationality: values.nationality,
                about_me: values.about_me,
                gender: values.gender,
                phone: values.phone,
                profile_visibility: values.profile_visibility,
                language: values.language,
                ethnicity: values.ethnicity,
                religion: values.religion,
                occupation: values.occupation,
                preferred_location: values.preferred_location,
                budget_range: values.budget_range,
                move_in_date_start: values.move_in_date_start,
                move_in_date_end: values.move_in_date_end,
                housing_type: values.housing_type,
                work_location_legacy: values.work_location_legacy,
                pet_preference: values.pet_preference,
                diet: values.diet,
                diet_other: values.diet_other,
                hobbies: values.hobbies,
                work_schedule: values.work_schedule,
                work_location: values.work_location,
                has_pets: values.has_pets,
                pet_type: values.pet_type,
                smoking: values.smoking,
                lives_with_smokers: values.lives_with_smokers,
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

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>

                            {/* Background Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {/* About Me Section */}
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
