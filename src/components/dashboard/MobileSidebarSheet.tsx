
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, LogOut, Home } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { AdminSidebar } from "./sidebar/AdminSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { RenovatorSidebar } from "./sidebar/RenovatorSidebar";
import { MortgageBrokerSidebar } from "./sidebar/MortgageBrokerSidebar";
import { LawyerSidebar } from "./sidebar/LawyerSidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { SidebarMenu } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function MobileSidebarSheet() {
    const { role: baseRole } = useRole();
    const { user, signOut } = useAuth();
    const location = useLocation();

    // Context-aware role detection
    const isSeekerRoute =
        location.pathname.startsWith('/dashboard/roommate-recommendations') ||
        location.pathname.startsWith('/dashboard/ideal-roommate') ||
        location.pathname.startsWith('/dashboard/rental-options') ||
        location.pathname.startsWith('/dashboard/buying-opportunities') ||
        location.pathname.startsWith('/dashboard/buy/') ||
        location.pathname.startsWith('/dashboard/rent/') ||
        location.pathname.startsWith('/dashboard/co-ownership/') ||
        location.pathname.startsWith('/dashboard/applications');

    const role = (isSeekerRoute && baseRole !== 'landlord' && baseRole !== 'admin') ? 'seeker' : baseRole;

    const isActive = (path: string) => {
        return (
            location.pathname === path || location.pathname.startsWith(path + "/")
        );
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 active:scale-95 text-muted-foreground hover:text-foreground hover:bg-accent/30 cursor-pointer">
                    <div className="p-1 rounded-lg transition-all duration-300">
                        <Menu size={22} />
                    </div>
                    <span className="text-xs mt-1 font-bold transition-all duration-300">Menu</span>
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b text-left">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="p-4 border-b bg-muted/20">
                    <RoleSwitcher />
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        <SidebarMenu>
                            {(() => {
                                // Forced role context based on URL
                                if (location.pathname.includes('/dashboard/admin')) return <AdminSidebar isActive={isActive} showLabels={true} />;
                                if (location.pathname.includes('/dashboard/landlord')) return <LandlordSidebar isActive={isActive} showLabels={true} />;
                                if (location.pathname.includes('/renovator/')) return <RenovatorSidebar isActive={isActive} showLabels={true} />;
                                if (location.pathname.includes('/dashboard/mortgage-broker')) return <MortgageBrokerSidebar isActive={isActive} showLabels={true} />;
                                if (location.pathname.includes('/dashboard/lawyer')) return <LawyerSidebar isActive={isActive} showLabels={true} />;

                                // Property browsing context
                                const isPropertyRoute =
                                    location.pathname.startsWith('/dashboard/buy/') ||
                                    location.pathname.startsWith('/dashboard/rent/') ||
                                    location.pathname.startsWith('/dashboard/co-ownership/') ||
                                    location.pathname.startsWith('/dashboard/rental-options') ||
                                    location.pathname.startsWith('/dashboard/buying-opportunities');

                                if (isPropertyRoute) return <SeekerSidebar isActive={isActive} showLabels={true} />;

                                // Fallback to base role
                                if (role === 'admin') return <AdminSidebar isActive={isActive} showLabels={true} />;
                                if (role === 'developer') return <DeveloperSidebar isActive={isActive} showLabels={true} />;
                                if (role === 'landlord') return <LandlordSidebar isActive={isActive} showLabels={true} />;
                                if (role === 'renovator') return <RenovatorSidebar isActive={isActive} showLabels={true} />;
                                if (role === 'mortgage_broker') return <MortgageBrokerSidebar isActive={isActive} showLabels={true} />;
                                if (role === 'lawyer') return <LawyerSidebar isActive={isActive} showLabels={true} />;

                                return <SeekerSidebar isActive={isActive} showLabels={true} />;
                            })()}
                        </SidebarMenu>
                    </div>
                </ScrollArea>

                {/* User Account Section */}
                <div className="p-4 border-t bg-muted/20 space-y-2">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-background">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
                            <span className="text-sm font-semibold truncate w-full">{user?.email?.split('@')[0]}</span>
                            <span className="text-xs text-muted-foreground truncate w-full">{user?.email}</span>
                        </div>
                    </div>

                    <Separator />

                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                        <Link to="/dashboard/settings">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </Button>

                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                        <Link to="/">
                            <Home className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={signOut}
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
