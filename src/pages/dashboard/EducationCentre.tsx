
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
        <div className="container mx-auto px-6 pt-2 pb-12">
            <div className="space-y-16">
                {resources.map((section, idx) => (
                    <div key={idx} className={`space-y-8 ${idx === 0 ? 'mt-0' : ''}`}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${section.color} shadow-lg shadow-primary/20`}>
                                        {section.icon}
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{section.category}</h2>
                                </div>
                                <p className="text-slate-500 max-w-xl">{section.description}</p>
                            </div>
                            <Button variant="ghost" className="group text-primary font-semibold hover:bg-primary/5">
                                View Full Hub <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {section.items.map((item, i) => (
                                <Card key={i} className={`group relative flex flex-col h-full bg-white border-slate-200/60 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden ${item.highlight ? 'ring-2 ring-primary/20' : ''}`}>
                                    {item.highlight && (
                                        <div className="absolute top-0 right-0 bg-primary px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-white z-10 animate-pulse">
                                            Featured
                                        </div>
                                    )}

                                    <CardHeader className="pt-8 px-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <Badge className="bg-slate-100 text-slate-900 hover:bg-slate-200 border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
                                                {item.badge}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 capitalize bg-slate-50 px-2 py-0.5 rounded-full">
                                                <Clock className="w-3 h-3" /> {item.duration}
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                                            {item.title}
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-grow px-8 pb-4">
                                        <CardDescription className="text-base text-slate-600 leading-relaxed font-medium">
                                            {item.description}
                                        </CardDescription>
                                    </CardContent>

                                    <CardFooter className="p-8 pt-4">
                                        <Button className="w-full bg-slate-900 hover:bg-primary text-white rounded-2xl h-12 text-sm font-bold shadow-lg shadow-slate-200 transition-all" asChild>
                                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                Read Guide <ExternalLink className="ml-2 h-4 w-4 opacity-50" />
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>



        </div>
    );
}
