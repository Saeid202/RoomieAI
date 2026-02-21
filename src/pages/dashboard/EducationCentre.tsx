
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
    Lightbulb,
    Home,
    DollarSign,
    BookOpen,
    ExternalLink,
    Leaf,
    GraduationCap,
    Building,
    Users,
    Search,
    Clock,
    ArrowRight,
    Sparkles
} from "lucide-react";

export default function EducationCentre() {
    const [searchQuery, setSearchQuery] = useState("");

    const resources = [
        {
            category: "Energy Saving",
            description: "Go green and save big on your monthly utility bills.",
            color: "from-emerald-500 to-teal-600",
            icon: <Leaf className="h-6 w-6 text-white" />,
            badgeNumber: "1",
            badgeColor: "bg-emerald-600",
            items: [
                {
                    title: "Energy Efficiency Rebates",
                    description: "Government rebates for upgrading to energy-efficient appliances and windows.",
                    badge: "Rebate",
                    level: "All Levels",
                    duration: "10 min",
                    link: "https://www.saveonenergy.ca/",
                    highlight: true
                },
                {
                    title: "Winter Heating Tips",
                    description: "Simple ways to reduce your heating bill during the colder months.",
                    badge: "Guide",
                    level: "Beginner",
                    duration: "5 min",
                    link: "https://www.ontario.ca/page/how-make-smart-energy-choices-home"
                },
                {
                    title: "Solar Panel Grants",
                    description: "Financial assistance for installing solar panels on residential properties.",
                    badge: "Grant",
                    level: "Intermediate",
                    duration: "15 min",
                    link: "https://natural-resources.canada.ca/energy-efficiency/homes/canada-greener-homes-initiative/24831"
                }
            ]
        },
        {
            category: "Housing Benefits",
            description: "Access support programs designed to keep housing affordable.",
            color: "from-blue-500 to-indigo-600",
            icon: <Home className="h-6 w-6 text-white" />,
            badgeNumber: "2",
            badgeColor: "bg-indigo-600",
            items: [
                {
                    title: "Rental Assistance Program",
                    description: "Monthly financial support for eligible low-income households.",
                    badge: "Benefit",
                    level: "Priority",
                    duration: "12 min",
                    link: "https://www.ontario.ca/page/housing-ontario"
                },
                {
                    title: "First-Time Home Buyer Incentive",
                    description: "A shared equity mortgage with the Government of Canada.",
                    badge: "Program",
                    level: "Advanced",
                    duration: "20 min",
                    link: "https://www.cmhc-schl.gc.ca/consumers/home-buying/government-of-canada-programs-for-homebuyers"
                },
                {
                    title: "Tenant Rights Guide",
                    description: "Comprehensive guide to understanding your rights and responsibilities.",
                    badge: "Legal",
                    level: "Must Read",
                    duration: "8 min",
                    link: "https://www.ontario.ca/page/renting-ontario-your-rights"
                }
            ]
        },
        {
            category: "Financial Aid",
            description: "Emergency support and long-term financial planning for renters.",
            color: "from-amber-500 to-orange-600",
            icon: <DollarSign className="h-6 w-6 text-white" />,
            badgeNumber: "3",
            badgeColor: "bg-orange-600",
            items: [
                {
                    title: "Emergency Rent Bank",
                    description: "Interest-free loans for tenants facing temporary financial crisis.",
                    badge: "Loan",
                    level: "Emergency",
                    duration: "15 min",
                    link: "https://www.toronto.ca/community-people/employment-social-support/housing-support/financial-support-for-housing/rent-bank/"
                },
                {
                    title: "Student Housing Support",
                    description: "Resources and financial aid specifically for student renters.",
                    badge: "Student",
                    level: "Academic",
                    duration: "5 min",
                    link: "https://www.ontario.ca/page/housing-ontario"
                },
                {
                    title: "Affordable Housing List",
                    description: "Directory of affordable housing units and application procedures.",
                    badge: "Directory",
                    level: "Essential",
                    duration: "30 min",
                    link: "https://www.toronto.ca/community-people/employment-social-support/housing-support/rent-geared-to-income-subsidy/"
                }
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <header className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                        <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gradient">
                            Education Centre
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Learn about renting, rights, ownership, and financial literacy
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                {resources.map((section, idx) => (
                    <section key={idx} className="mb-8">
                        <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-400">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`${section.badgeColor} text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0`}>{section.badgeNumber}</span>
                                <Label className="text-lg font-bold text-slate-900">{section.category}</Label>
                            </div>
                            <p className="text-sm text-slate-600 mb-6 font-medium">{section.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item, i) => (
                                    <Card key={i} className={`group relative flex flex-col h-full bg-white border-2 border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden ${item.highlight ? 'ring-2 ring-purple-300' : ''}`}>
                                        {item.highlight && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-white z-10">
                                                Featured
                                            </div>
                                        )}

                                        <CardHeader className="pt-6 px-6">
                                            <div className="flex justify-between items-center mb-3">
                                                <Badge className="bg-slate-100 text-slate-900 hover:bg-slate-200 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                                    {item.badge}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                    <Clock className="w-3 h-3" /> {item.duration}
                                                </div>
                                            </div>
                                            <CardTitle className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="flex-grow px-6 pb-4">
                                            <CardDescription className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {item.description}
                                            </CardDescription>
                                        </CardContent>

                                        <CardFooter className="p-6 pt-4">
                                            <Button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl h-11 text-sm font-bold shadow-lg transition-all" asChild>
                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                    Read Guide <ExternalLink className="ml-2 h-4 w-4" />
                                                </a>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
