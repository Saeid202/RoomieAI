import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, Wallet, MapPin, ExternalLink, ShieldCheck, Mail, Phone, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ChatInfoPanelProps {
    userId: string;
    userName: string;
    role: "landlord" | "tenant" | "renovator";
    onClose?: () => void;
    className?: string;
}

export function ChatInfoPanel({ userId, userName, role, onClose, className }: ChatInfoPanelProps) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Try fetching generic profile first
                const { data: userProfile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .maybeSingle();

                // If it's a renovator, try fetching partner details
                let renovatorProfile = null;
                const { data: renPartner } = await supabase
                    .from("renovation_partners" as any)
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (renPartner) renovatorProfile = renPartner;

                const r = renPartner as any;
                setProfile({
                    ...userProfile,
                    ...renovatorProfile,
                    // Prioritize renovator fields if they exist
                    full_name: r?.name || userProfile?.full_name || userName,
                    company: r?.company
                });
            } catch (error) {
                console.error("Error fetching profile details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfileData();
    }, [userId, userName]);

    if (loading) {
        return (
            <div className={`w-[320px] bg-white border-l border-slate-100 p-6 flex flex-col gap-6 ${className}`}>
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    const isRenovator = !!profile?.company;

    return (
        <div className={`w-[320px] bg-white dark:bg-slate-950 flex flex-col h-full overflow-y-auto ${className}`}>
            <div className="p-8 flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900 pointer-events-none" />

                <div className="relative mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full opacity-20 blur-sm" />
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl relative z-10">
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-2xl font-black">
                            {userName[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                    {profile.company ? profile.company : userName}
                </h3>
                {profile.company && (
                    <p className="text-sm font-medium text-slate-500 mb-1">{profile.full_name}</p>
                )}

                <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border-transparent hover:bg-slate-200">
                        {isRenovator ? "Renovator" : role === "landlord" ? "Landlord" : "Tenant"}
                    </Badge>
                    {isRenovator && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Verified Pro</Badge>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Contact Info */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contact Information</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="truncate">{profile?.email || "Email hidden"}</span>
                    </div>
                    {profile?.phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-slate-400" />
                            </div>
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile?.location && (
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-slate-400" />
                            </div>
                            <span>{profile.location}</span>
                        </div>
                    )}
                </div>

                {/* Renovator Specifics */}
                {isRenovator && profile.specialties && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(profile.specialties) && profile.specialties.map((spec: string, i: number) => (
                                <Badge key={i} variant="outline" className="font-medium text-slate-600 border-slate-200">
                                    {spec}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tenant/Seeker Specifics - Placeholder for future logic */}
                {!isRenovator && (role === 'tenant') && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Preferences</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <Wallet className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase">Budget</span>
                                </div>
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{profile?.budget_min ? `$${profile.budget_min} - $${profile.budget_max}` : "Not set"}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-1 text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-[10px] font-bold uppercase">Move In</span>
                                </div>
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{profile?.move_in_date || "Flexible"}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        variant="outline"
                        className="w-full h-11 border-slate-200 hover:bg-slate-50 hover:text-blue-600 font-bold"
                        onClick={() => navigate(`/dashboard/user/${userId}`)}
                    >
                        View Full Profile <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
