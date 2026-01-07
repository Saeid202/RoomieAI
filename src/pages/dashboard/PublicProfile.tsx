
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Linkedin, Globe, Calendar, GripHorizontal, ArrowLeft, Building, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface PublicProfile {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    age?: number;
    nationality?: string;
    linkedin?: string;
    about_me?: string;
    user_type?: string;
}

interface RenovatorProfile {
    company: string;
    name: string;
    description?: string;
    specialties?: string[];
    location?: string;
    email?: string;
    phone?: string;
}

export default function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [renovator, setRenovator] = useState<RenovatorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Fetch basic profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!profileError) {
                    setProfile(profileData as any);
                }

                // Fetch potential Renovator profile
                const { data: renovatorData } = await supabase
                    .from('renovation_partners' as any)
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (renovatorData) {
                    setRenovator(renovatorData as any);
                }

                if (profileError && !renovatorData) {
                    throw profileError;
                }

            } catch (err: any) {
                console.error("Error fetching public profile:", err);
                // Only set error if we found NOTHING
                if (!profile && !renovator) {
                    setError("Could not load profile. It may not exist or is private.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-3xl space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || (!profile && !renovator)) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-slate-800">Profile Not Found</h2>
                <p className="text-slate-600 mt-2">{error || "The user profile you are looking for is unavailable."}</p>
                <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">
                    Go Back
                </Button>
            </div>
        );
    }

    // Renovator View
    if (renovator) {
        return (
            <div className="p-4 md:p-8 max-w-4xl space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-roomie-purple/10 rounded-2xl flex items-center justify-center text-roomie-purple">
                        <Building className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{renovator.company}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-roomie-purple text-white text-xs font-bold rounded-full uppercase tracking-wider">Renovation Pro</span>
                            <span className="text-slate-500 font-medium text-sm flex items-center gap-1">
                                <User className="h-3 w-3" /> {renovator.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>About the Business</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {renovator.description || "No description provided."}
                            </p>

                            {renovator.specialties && renovator.specialties.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Specialties</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {renovator.specialties.map((spec, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle>Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {renovator.location && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-slate-50 rounded-lg"><Globe className="h-4 w-4 text-slate-400" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Location</p>
                                        <p className="font-medium">{renovator.location}</p>
                                    </div>
                                </div>
                            )}

                            {renovator.email && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-slate-50 rounded-lg"><User className="h-4 w-4 text-slate-400" /></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                                        <p className="font-medium text-sm sm:truncate sm:max-w-[200px]" title={renovator.email}>{renovator.email}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!profile) return null; // Should be handled by error check above

    const displayName = profile.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : profile.full_name || "Anonymous User";

    return (
        <div className="p-4 md:p-8 max-w-3xl space-y-6">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{displayName}</h1>
                    <p className="text-slate-500 font-medium capitalize">{profile.user_type || 'User'}</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.age && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-slate-50 rounded-lg"><Calendar className="h-4 w-4 text-slate-400" /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Age</p>
                                    <p className="font-medium">{profile.age} years old</p>
                                </div>
                            </div>
                        )}

                        {profile.nationality && (
                            <div className="flex items-center gap-3 text-slate-700">
                                <div className="p-2 bg-slate-50 rounded-lg"><Globe className="h-4 w-4 text-slate-400" /></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nationality</p>
                                    <p className="font-medium">{profile.nationality}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {profile.linkedin && (
                        <div className="flex items-center gap-3 text-slate-700 pt-2 border-t border-slate-100">
                            <div className="p-2 bg-blue-50 rounded-lg"><Linkedin className="h-4 w-4 text-blue-600" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">LinkedIn</p>
                                <a
                                    href={profile.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:underline truncate block max-w-[200px] md:max-w-md"
                                >
                                    {profile.linkedin}
                                </a>
                            </div>
                        </div>
                    )}

                    {profile.about_me && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                <GripHorizontal className="h-3 w-3" /> Bio
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {profile.about_me}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
