import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { User, Linkedin, Globe, Mail, Calendar, GripHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    age: z.coerce.number().min(18, "You must be at least 18 years old").max(120, "Invalid age"),
    email: z.string().email("Invalid email address"),
    linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    nationality: z.string().min(1, "Nationality is required"),
    about_me: z.string().optional(),
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
            first_name: "",
            last_name: "",
            age: 18,
            email: "",
            linkedin: "",
            nationality: "",
            about_me: "",
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
                        email: profile.email || user.email || "", // Email usually shouldn't change, but allow user to edit contact email?
                        linkedin: profile.linkedin || "",
                        nationality: profile.nationality || "",
                        about_me: profile.about_me || "",
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
                full_name: `${values.first_name} ${values.last_name}`.trim(), // Maintain full_name sync
                age: values.age,
                email: values.email,
                linkedin: values.linkedin,
                nationality: values.nationality,
                about_me: values.about_me,
                user_type: userType,
                updated_at: new Date().toISOString(),
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="John" {...field} />
                                                </div>
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
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="Doe" {...field} />
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
                                <FormField
                                    control={form.control}
                                    name="nationality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nationality</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-9" placeholder="e.g. Canadian" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

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
