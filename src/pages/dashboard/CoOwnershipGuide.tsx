import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Home, ShieldCheck, Handshake, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CoOwnershipGuidePage() {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full px-4 md:px-10 py-6 overflow-y-auto">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-6 pl-0 hover:bg-transparent hover:text-roomie-purple"
            >
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Button>

            <div className="space-y-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">How the Co-Ownership Program Works</h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
                        A structured, transparent pathway to home ownership for everyday buyers.
                    </p>
                </div>

                {/* Purpose */}
                <section className="bg-gradient-to-br from-indigo-50 to-white p-8 md:p-12 rounded-[2.5rem] border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
                        <div className="p-4 bg-white shadow-lg shadow-indigo-100 rounded-3xl text-roomie-purple shrink-0">
                            <Home className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-slate-900">Purpose of This Program</h2>
                            <div className="text-slate-700 leading-relaxed text-lg space-y-4">
                                <p>
                                    The Roomie AI Co-Ownership Program exists to solve a simple but widespread problem:
                                </p>
                                <p className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                                    "Many people can afford part of a home—but the system requires them to afford all of it."
                                </p>
                                <p>
                                    This program provides a structured, transparent way for people with limited capital to jointly buy, live in, and own a home together—without informal arrangements, uncertainty, or hidden risks.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 font-bold text-roomie-purple bg-white border border-indigo-100 shadow-sm w-fit px-6 py-4 rounded-2xl">
                                <ShieldCheck className="h-6 w-6" />
                                <span>Our goal is not speed or speculation. Our goal is early, safe access to home ownership.</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Who is it for */}
                <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <Users className="h-7 w-7 text-emerald-500" /> Who This Program Is For
                        </h2>
                        <ul className="space-y-4">
                            {[
                                "Individuals or couples with partial down payment capital",
                                "First-time or early-stage home buyers",
                                "People who want to live in the property, not just invest",
                                "Buyers planning to stay at least 1 year or longer",
                                "People who value clear rules and predictability"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">✓</div>
                                    <span className="leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-8 p-6 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium border border-slate-100 leading-relaxed">
                            Typical participants contribute between <span className="text-slate-900 font-bold">$20,000 and $70,000</span> and want to enter the housing market sooner by sharing ownership responsibly.
                        </p>
                    </section>

                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <Handshake className="h-7 w-7 text-blue-500" /> How It Works
                        </h2>
                        <div className="flex-1 space-y-6">
                            <p className="text-slate-700 leading-relaxed font-medium">
                                If you have some savings but not enough to buy a home on your own, this program helps you find another person in the same position and move forward together.
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <span className="font-black text-blue-500 text-xl">1</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Match First</h4>
                                        <p className="text-sm text-slate-600">Roomie AI helps you find a compatible co-buyer first, not just a property.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <span className="font-black text-blue-500 text-xl">2</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Meet & Align</h4>
                                        <p className="text-sm text-slate-600">Connect, talk, and decide if you share lifestyle and ownership goals.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <span className="font-black text-blue-500 text-xl">3</span>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Formalize</h4>
                                        <p className="text-sm text-slate-600">Use our professional support to structure the purchase properly.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Hub Section */}
                <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-roomie-purple opacity-20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                    <div className="relative z-10 space-y-8">
                        <div>
                            <h2 className="text-3xl font-black mb-2">Find a Compatible Co-Buyer</h2>
                            <p className="text-slate-300 text-lg max-w-2xl">
                                Inside the Roomie AI Co-Ownership Hub, you can see other individuals who are looking to co-buy.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { title: 'View Profiles', icon: '👀' },
                                { title: 'Connect', icon: '💬' },
                                { title: 'Share Goals', icon: '🎯' },
                                { title: 'Meet Up', icon: '☕' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl text-center font-bold border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    {item.title}
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-400 text-center md:text-left text-sm font-medium">
                            There is no pressure and no obligation to proceed unless both parties feel aligned.
                        </p>
                    </div>
                </section>

                {/* Support & Exit */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                                <ShieldCheck className="h-6 w-6 text-roomie-purple" /> Professional Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4 text-slate-600 font-medium leading-relaxed">
                            <p>
                                Roomie AI works with experienced real estate and co-ownership lawyers and stays involved throughout the purchase, living, and exit stages.
                            </p>
                            <p>
                                Our role is to ensure everything follows a clear and reliable structure—from entering the agreement to exiting it smoothly if needed.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                                <LogOut className="h-6 w-6 text-orange-500" /> How Exit Works
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6 text-slate-600 font-medium">
                            <p>Life changes—and the program is designed for that reality. The exit philosophy is clear:</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Inform your co-owner in advance</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Sell to other co-owner (Right of First Refusal)</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Offer your share in Co-ownership Hub</li>
                                <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Contact Roomie AI for assistance</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Case Study */}
                <section className="bg-emerald-50 rounded-[2.5rem] p-8 md:p-12 border border-emerald-100 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-100 rounded-full opacity-50 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-emerald-200 text-emerald-800 text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full">Success Story</span>
                        </div>
                        <h2 className="text-3xl font-bold text-emerald-900 mb-6">Case Study: Ali & Mohamad</h2>
                        <div className="space-y-6 text-emerald-800 leading-relaxed text-lg font-medium opacity-90">
                            <p>
                                Ali and Mohamad both wanted to buy a home, but neither could afford a full down payment on their own. Each had some savings and was tired of renting, but buying alone was not an option.
                            </p>
                            <p>
                                Through the Roomie AI Co-Ownership Hub, they found each other. They connected, talked about their goals, met in person, and realized they had similar plans—they both wanted to live in the home long term and gradually build ownership.
                            </p>
                            <p className="font-semibold text-emerald-950 p-4 bg-white/50 rounded-2xl border border-emerald-100/50">
                                Today, Ali and Mohamad live in the home they co-own. Instead of continuing to rent and wait, they entered the market earlier—with clarity, structure, and shared confidence.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
