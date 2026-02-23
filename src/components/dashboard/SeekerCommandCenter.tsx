
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
    Circle,
    ChevronRight,
    Zap,
    Users,
    User,
    Wallet,
    Calendar,
    ArrowUpRight,
    Shield,
    MessageSquare,
    HelpCircle,
    CreditCard,
    Briefcase,
    Home,
    Star,
    FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasCompleteProfile } from "@/services/userProfileService";
import { fetchRoommateProfiles, convertRoommateToMatchResult } from "@/services/matchingService";
import { PaymentService } from "@/services/paymentService";
import { getUserApplications } from "@/services/rentalApplicationService";
import { fetchCoOwnershipSignals } from "@/services/propertyService";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function SeekerCommandCenter() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        profileComplete: false,
        matchingActive: false,
        activeApplications: 0,
        nextRentDue: null as { amount: number; date: string } | null,
        coOwnershipActive: false,
        matches: [] as any[],
        walletConnected: false
    });

    useEffect(() => {
        async function loadDashboardData() {
            if (!user) return;

            try {
                setLoading(true);

                // 1. Check Profile
                const profileComplete = await hasCompleteProfile(user.id);

                // 2. Fetch Matching
                let matches: any[] = [];
                if (profileComplete) {
                    const roommateProfiles = await fetchRoommateProfiles();
                    matches = roommateProfiles.slice(0, 3).map(convertRoommateToMatchResult);
                }

                // 3. Payments & Wallet
                const paymentAccount = await PaymentService.getPaymentAccount(user.id, 'tenant');
                const paymentMethods = await PaymentService.getPaymentMethods(user.id);

                // 4. Applications
                const apps = await getUserApplications();
                const activeApps = apps.filter(a => a.status === 'pending' || a.status === 'under_review' || a.status === 'approved').length;

                // 5. Co-ownership Signals
                const signals = await fetchCoOwnershipSignals();
                const userSignals = signals.filter(s => s.user_id === user.id).length;

                // 6. Next Rent Due (Logic from AutoPay.tsx)
                const { data: installments } = await supabase
                    .from('rent_ledgers' as any)
                    .select('due_date, rent_amount')
                    .eq('status', 'unpaid')
                    .gte('due_date', new Date().toISOString().split('T')[0])
                    .order('due_date', { ascending: true })
                    .limit(1);

                const nextRent = installments && installments.length > 0
                    ? { amount: installments[0].rent_amount, date: new Date(installments[0].due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
                    : null;

                setStats({
                    profileComplete,
                    matchingActive: profileComplete,
                    activeApplications: activeApps,
                    nextRentDue: nextRent,
                    coOwnershipActive: userSignals > 0,
                    matches: matches,
                    walletConnected: !!paymentAccount && paymentMethods.length > 0
                });
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-roomie-purple"></div>
            </div>
        );
    }

    // Determine Next Best Action
    let nextAction = {
        title: "Complete your profile",
        description: "Unlock roommate matches and personalized housing insights.",
        cta: "Go to Profile",
        path: "/dashboard/profile"
    };

    if (!stats.profileComplete) {
        nextAction = {
            title: "Complete your profile",
            description: "Unlock roommate matches and personalized housing insights.",
            cta: "Complete Profile",
            path: "/dashboard/profile"
        };
    } else if (!stats.walletConnected) {
        nextAction = {
            title: "Connect your wallet",
            description: "Secure your payments and enable instant rent transfers.",
            cta: "Connect Wallet",
            path: "/dashboard/wallet"
        };
    } else if (!stats.coOwnershipActive) {
        nextAction = {
            title: "Post a Co-ownership Signal",
            description: "Find partners and move closer to home ownership.",
            cta: "Post a Signal",
            path: "/dashboard/buying-opportunities"
        };
    } else {
        nextAction = {
            title: "Explore Matches",
            description: "We found new compatible roommates for you today.",
            cta: "View Matches",
            path: "/dashboard/matches"
        };
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-12 pb-20 animate-in fade-in duration-700">

            {/* 1️⃣ Hero Status Summary */}
            <section>
                <Card className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white overflow-hidden rounded-[32px]">
                    <div className="p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-6">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                Your Housing Plan <span className="text-roomie-purple">– At a Glance</span>
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <StatusChip
                                    label="Profile"
                                    status={stats.profileComplete ? "Completed" : "Incomplete"}
                                    active={stats.profileComplete}
                                />
                                <StatusChip
                                    label="Matching"
                                    status={stats.matchingActive ? "Active" : "Not Started"}
                                    active={stats.matchingActive}
                                />
                                <StatusChip
                                    label="Applications"
                                    status={stats.activeApplications > 0 ? `${stats.activeApplications} Active` : "None"}
                                    active={stats.activeApplications > 0}
                                />
                                <StatusChip
                                    label="Payments"
                                    status={stats.nextRentDue ? `Due ${stats.nextRentDue.date}` : "No rent due"}
                                    active={!!stats.nextRentDue}
                                />
                                <StatusChip
                                    label="Co-ownership"
                                    status={stats.coOwnershipActive ? "Active" : "None"}
                                    active={stats.coOwnershipActive}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(nextAction.path)}
                            className="bg-roomie-purple hover:bg-roomie-purple/90 text-white font-black px-10 h-16 rounded-2xl shadow-xl shadow-roomie-purple/20 group transition-all text-lg"
                        >
                            Continue My Plan
                            <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </Card>
            </section>

            {/* 2️⃣ Next Best Action (AI-Driven Focus) */}
            <section className="relative">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-roomie-purple/5 blur-[100px] -z-10 rounded-full" />
                <Card className="border-2 border-roomie-purple/10 shadow-2xl shadow-roomie-purple/5 bg-gradient-to-br from-white to-roomie-purple/[0.01] rounded-[32px] overflow-hidden">
                    <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                        <div className="w-24 h-24 bg-roomie-purple/10 rounded-[28px] flex items-center justify-center flex-shrink-0 relative">
                            <div className="absolute inset-0 bg-roomie-purple/20 rounded-[28px] animate-ping opacity-20 scale-75" />
                            <Zap className="h-12 w-12 text-roomie-purple fill-roomie-purple" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <span className="text-roomie-purple font-black text-sm uppercase tracking-[0.2em]">Recommended Next Step</span>
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">{nextAction.title}</h2>
                            <p className="text-slate-500 font-medium text-xl leading-relaxed">{nextAction.description}</p>
                        </div>
                        <Button
                            size="lg"
                            onClick={() => navigate(nextAction.path)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-12 h-16 rounded-2xl w-full md:w-auto text-lg shadow-xl"
                        >
                            {nextAction.cta}
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* 3️⃣ Matches Snapshot */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Matches</h3>
                        <Button variant="ghost" onClick={() => navigate("/dashboard/matches")} className="text-roomie-purple font-black hover:bg-roomie-purple/5 transition-colors">
                            View All <ArrowUpRight className="ml-1 h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {stats.matches.length > 0 ? (
                            stats.matches.map((match: any, idx: number) => (
                                <MatchBriefCard key={idx} match={match} />
                            ))
                        ) : null}

                        {!stats.profileComplete && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[6px] z-10 rounded-[32px] flex items-center justify-center p-8 text-center border-2 border-dashed border-roomie-purple/20 shadow-inner">
                                    <div className="space-y-6 max-w-xs">
                                        <p className="text-slate-900 font-black text-xl leading-snug">Complete your profile to unlock matches</p>
                                        <Button
                                            size="lg"
                                            onClick={() => navigate("/dashboard/profile")}
                                            className="bg-roomie-purple text-white font-black rounded-2xl px-8 shadow-lg shadow-roomie-purple/20"
                                        >
                                            Go to Profile
                                        </Button>
                                    </div>
                                </div>
                                {/* Visual placeholders for blurred cards */}
                                <div className="space-y-4 filter blur-[3px] pointer-events-none opacity-40">
                                    <MatchBriefPlaceholder />
                                    <MatchBriefPlaceholder />
                                    <MatchBriefPlaceholder />
                                </div>
                            </div>
                        )}

                        {stats.profileComplete && stats.matches.length === 0 && (
                            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[32px] p-16 text-center">
                                <Users className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                                <p className="text-slate-500 font-bold text-lg">Finding your perfect roommates... Check back soon!</p>
                            </Card>
                        )}
                    </div>
                </section>

                {/* 4️⃣ Financial Snapshot */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Finances</h3>
                        <Button variant="ghost" onClick={() => navigate("/dashboard/wallet")} className="text-roomie-purple font-black hover:bg-roomie-purple/5 transition-colors">
                            Manage Payments <ChevronRight className="ml-1 h-5 w-5" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FinanceCard
                            icon={<Wallet className="h-8 w-8 text-emerald-500" />}
                            label="Digital Wallet"
                            status={stats.walletConnected ? "Connected" : "Not Connected"}
                            active={stats.walletConnected}
                        />
                        {stats.nextRentDue ? (
                            <Card className="col-span-1 sm:col-span-2 bg-slate-900 text-white rounded-[32px] p-8 overflow-hidden relative border-none shadow-2xl">
                                <div className="absolute top-0 right-0 p-12 opacity-10 scale-150">
                                    <Calendar className="h-40 w-40" />
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="space-y-2 text-center sm:text-left">
                                        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Next Rent Due</p>
                                        <h4 className="text-5xl font-black tracking-tighter">${stats.nextRentDue.amount}</h4>
                                        <p className="text-emerald-400 font-black text-base flex items-center justify-center sm:justify-start gap-2">
                                            <Calendar className="h-4 w-4" /> Due on {stats.nextRentDue.date}
                                        </p>
                                    </div>
                                    <Button className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl h-16 px-10 text-lg shadow-xl active:scale-95 transition-all">
                                        Pay Now
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="col-span-1 sm:col-span-2 bg-slate-50 border-dashed border-2 border-slate-200 rounded-[32px] p-8 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <FileText className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 text-xl tracking-tight">No Rent Due</h4>
                                        <p className="text-slate-500 font-medium">Your account is fully up to date. Keep it up!</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </section>
            </div>

            {/* 5️⃣ Opportunities (Contextual) */}
            <section className="space-y-8 pt-8 border-t border-slate-100/50">
                <h3 className="text-2xl font-black text-slate-900 px-4 tracking-tight">Opportunities for You</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <OpportunityCard
                        icon={<Home className="h-8 w-8 text-orange-500" />}
                        title="Co-ownership"
                        desc="Join forces to buy your first home sooner."
                        path="/dashboard/buying-opportunities"
                    />
                    <OpportunityCard
                        icon={<Briefcase className="h-8 w-8 text-blue-500" />}
                        title="Renovators"
                        desc="Top-tier partners recommended by Roomie AI."
                        path="/dashboard/renovators"
                    />
                </div>
            </section>

            {/* 6️⃣ Support & Trust Strip (Footer) */}
            <section className="pt-12">
                <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 py-8 bg-slate-50/50 rounded-[32px]">
                    <button onClick={() => navigate("/dashboard/legal-ai")} className="flex items-center gap-3 text-slate-500 hover:text-roomie-purple font-black transition-all group active:scale-95">
                        <Shield className="h-6 w-6 group-hover:scale-110 group-hover:fill-roomie-purple/10 transition-transform" />
                        <span className="text-sm tracking-wide">ASK LEGAL AI</span>
                    </button>
                    <button onClick={() => navigate("/dashboard/chats")} className="flex items-center gap-3 text-slate-500 hover:text-roomie-purple font-black transition-all group active:scale-95">
                        <MessageSquare className="h-6 w-6 group-hover:scale-110 group-hover:fill-roomie-purple/10 transition-transform" />
                        <span className="text-sm tracking-wide">MESSAGES</span>
                    </button>
                    <button onClick={() => navigate("/faq")} className="flex items-center gap-3 text-slate-500 hover:text-roomie-purple font-black transition-all group active:scale-95">
                        <HelpCircle className="h-6 w-6 group-hover:scale-110 group-hover:fill-roomie-purple/10 transition-transform" />
                        <span className="text-sm tracking-wide">HELP CENTER</span>
                    </button>
                </div>
            </section>

        </div>
    );
}

function StatusChip({ label, status, active }: { label: string; status: string; active: boolean }) {
    return (
        <div className={`flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-2xl border transition-all ${active
                ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm"
                : "bg-slate-50 border-slate-100 text-slate-400"
            }`}>
            {active ? <CheckCircle className="h-4 w-4 fill-emerald-100" /> : <Circle className="h-4 w-4" />}
            <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-black opacity-60 tracking-[0.1em] mb-0.5">{label}</span>
                <span className="text-sm font-black tracking-tight">{status}</span>
            </div>
        </div>
    );
}

function MatchBriefCard({ match }: { match: any }) {
    const navigate = useNavigate();
    const initials = match.name.split(" ").map((n: string) => n[0]).join("");

    return (
        <Card
            onClick={() => navigate("/dashboard/matches")}
            className="border-none shadow-[0_4px_15px_rgb(0,0,0,0.02)] bg-white p-6 rounded-[24px] hover:shadow-[0_15px_35px_rgba(110,89,255,0.08)] hover:-translate-y-1 transition-all flex items-center gap-5 group cursor-pointer border-l-4 border-transparent hover:border-roomie-purple"
        >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-roomie-purple to-indigo-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-roomie-purple/10">
                {initials}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-slate-900 text-lg tracking-tight">{match.name}</h4>
                    <span className="text-emerald-500 font-extrabold text-sm bg-emerald-50 px-3 py-1 rounded-full">{match.compatibilityScore}% Match</span>
                </div>
                <p className="text-slate-500 text-sm font-semibold tracking-tight">{match.location} · <span className="text-slate-400">Budget ${match.budget[0]}-${match.budget[1]}</span></p>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-roomie-purple group-hover:translate-x-1 transition-all" />
        </Card>
    );
}

function MatchBriefPlaceholder() {
    return (
        <div className="bg-white h-24 rounded-[24px] flex items-center gap-5 p-6 border border-slate-50">
            <div className="h-16 w-16 rounded-2xl bg-slate-100" />
            <div className="flex-1 space-y-3">
                <div className="h-5 bg-slate-100 rounded-full w-1/3" />
                <div className="h-3 bg-slate-100 rounded-full w-2/3" />
            </div>
        </div>
    );
}

function FinanceCard({ icon, label, status, active }: { icon: any; label: string; status: string; active: boolean }) {
    return (
        <Card className={`border-none p-8 rounded-[32px] transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${active ? "bg-white shadow-[0_4px_25px_rgb(0,0,0,0.03)]" : "bg-slate-50/50 border-dashed border-2 border-slate-100"
            }`}>
            <div className="flex items-center justify-between w-full mb-6">
                <div className={`p-3 rounded-2xl ${active ? "bg-slate-50" : "opacity-30"}`}>
                    {icon}
                </div>
                {active ? (
                    <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px] tracking-widest px-3">ACTIVE</Badge>
                ) : (
                    <Badge variant="outline" className="text-slate-300 font-black text-[10px] tracking-widest border-slate-200">MISSING</Badge>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{label}</p>
                <p className={`text-xl font-black tracking-tight ${active ? "text-slate-900" : "text-slate-300"}`}>{status}</p>
            </div>
        </Card>
    );
}

function OpportunityCard({ icon, title, desc, path }: { icon: any; title: string; desc: string; path: string }) {
    const navigate = useNavigate();
    return (
        <Card
            onClick={() => navigate(path)}
            className="border-none bg-white p-8 rounded-[32px] hover:shadow-[0_25px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-roomie-purple group-hover:text-white transition-all shadow-sm">
                {icon}
            </div>
            <h4 className="font-black text-slate-900 text-xl tracking-tight mb-2">{title}</h4>
            <p className="text-slate-500 text-sm font-semibold pr-4 leading-relaxed tracking-tight">{desc}</p>
        </Card>
    );
}
