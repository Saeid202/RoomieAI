import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Home, DollarSign, BookOpen, ExternalLink, Leaf, Zap, GraduationCap, Building, Users } from "lucide-react";

export default function EducationCentre() {
    const resources = [
        {
            category: "Energy Saving",
            icon: <Leaf className="h-5 w-5 text-green-500" />,
            items: [
                {
                    title: "Energy Efficiency Rebates",
                    description: "Government rebates for upgrading to energy-efficient appliances and windows.",
                    badge: "Rebate",
                    link: "https://www.saveonenergy.ca/"
                },
                {
                    title: "Winter Heating Tips",
                    description: "Simple ways to reduce your heating bill during the colder months.",
                    badge: "Guide",
                    link: "https://www.ontario.ca/page/how-make-smart-energy-choices-home"
                },
                {
                    title: "Solar Panel Grants",
                    description: "Financial assistance for installing solar panels on residential properties.",
                    badge: "Grant",
                    link: "https://natural-resources.canada.ca/energy-efficiency/homes/canada-greener-homes-initiative/24831"
                }
            ]
        },
        {
            category: "Housing Benefits",
            icon: <Home className="h-5 w-5 text-blue-500" />,
            items: [
                {
                    title: "Rental Assistance Program",
                    description: "Monthly financial support for eligible low-income households.",
                    badge: "Benefit",
                    link: "https://www.ontario.ca/page/housing-ontario"
                },
                {
                    title: "First-Time Home Buyer Incentive",
                    description: "A shared equity mortgage with the Government of Canada.",
                    badge: "Program",
                    link: "https://www.cmhc-schl.gc.ca/consumers/home-buying/government-of-canada-programs-for-homebuyers"
                },
                {
                    title: "Tenant Rights Guide",
                    description: "Comprehensive guide to understanding your rights and responsibilities.",
                    badge: "Legal",
                    link: "https://www.ontario.ca/page/renting-ontario-your-rights"
                }
            ]
        },
        {
            category: "Financial Aid",
            icon: <DollarSign className="h-5 w-5 text-yellow-500" />,
            items: [
                {
                    title: "Emergency Rent Bank",
                    description: "Interest-free loans for tenants facing temporary financial crisis.",
                    badge: "Loan",
                    link: "https://www.toronto.ca/community-people/employment-social-support/housing-support/financial-support-for-housing/rent-bank/"
                },
                {
                    title: "Student Housing Support",
                    description: "Resources and financial aid specifically for student renters.",
                    badge: "Student",
                    link: "https://www.ontario.ca/page/housing-ontario"
                },
                {
                    title: "Affordable Housing List",
                    description: "Directory of affordable housing units and application procedures.",
                    badge: "Directory",
                    link: "https://www.toronto.ca/community-people/employment-social-support/housing-support/rent-geared-to-income-subsidy/"
                }
            ]
        }
    ];

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Education Centre</h1>
                    <p className="text-muted-foreground mt-1">
                        Resources, benefits, and guides for smarter housing decisions.
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg rounded-full" asChild>
                    <a href="https://www.ontario.ca/page/housing-ontario" target="_blank" rel="noopener noreferrer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Browse All Guides
                    </a>
                </Button>
            </div>

            {/* Featured Banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-10 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mb-2">New Program</Badge>
                        <h2 className="text-2xl font-bold">2025 Green Home Initiative</h2>
                        <p className="text-indigo-100 max-w-xl">
                            Get up to $5,000 in grants for making your home more energy-efficient before the winter season.
                            Open to both landlords and tenants.
                        </p>
                    </div>
                    <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold rounded-xl px-6" asChild>
                        <a href="https://www.saveonenergy.ca/" target="_blank" rel="noopener noreferrer">
                            Check Eligibility
                        </a>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg">All Resources</TabsTrigger>
                    <TabsTrigger value="landlord" className="rounded-lg">Landlords</TabsTrigger>
                    <TabsTrigger value="tenant" className="rounded-lg">Tenants</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-8">
                    {resources.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-muted rounded-full">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-semibold">{section.category}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item, i) => (
                                    <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-muted/60 bg-white/50 backdrop-blur-sm flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className={`${item.badge === 'Rebate' || item.badge === 'Grant' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    item.badge === 'Benefit' || item.badge === 'Program' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {item.badge}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" asChild>
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {item.title}
                                                </a>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <CardDescription className="text-sm leading-relaxed">
                                                {item.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter className="pt-2">
                                            <Button variant="link" className="px-0 text-sm font-semibold group-hover:translate-x-1 transition-transform" asChild>
                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                    Learn more &rarr;
                                                </a>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </TabsContent>
                {/* Placeholder contents for filtered tabs */}
                <TabsContent value="landlord">
                    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        <Building className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Filtered landlord resources would appear here.</p>
                    </div>
                </TabsContent>
                <TabsContent value="tenant">
                    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Filtered tenant resources would appear here.</p>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Want to learn more?</h2>
                <p className="text-slate-300 max-w-2xl mx-auto mb-6">
                    Our Education Centre is constantly updated with the latest government programs, legal changes, and housing tips.
                    Subscribe to get notified about new benefits.
                </p>
                <div className="flex max-w-md mx-auto gap-2">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button>Subscribe</Button>
                </div>
            </div>
        </div>
    );
}
