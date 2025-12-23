
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { SeekerSidebar } from "./sidebar/SeekerSidebar";
import { LandlordSidebar } from "./sidebar/LandlordSidebar";
import { AdminSidebar } from "./sidebar/AdminSidebar";
import { DeveloperSidebar } from "./sidebar/DeveloperSidebar";
import { RoleSwitcher } from "./RoleSwitcher";
import { SidebarMenu } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "react-router-dom";

export function MobileSidebarSheet() {
    const { role } = useRole();
    const location = useLocation();
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
            <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 border-b text-left">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="p-4 border-b bg-muted/20">
                    <RoleSwitcher />
                </div>
                <ScrollArea className="h-[calc(100vh-130px)]">
                    <div className="p-2">
                        <SidebarMenu>
                            {role === 'admin' ? (
                                <AdminSidebar isActive={isActive} showLabels={true} />
                            ) : role === 'developer' ? (
                                <DeveloperSidebar isActive={isActive} showLabels={true} />
                            ) : role === 'landlord' ? (
                                <LandlordSidebar isActive={isActive} showLabels={true} />
                            ) : (
                                <SeekerSidebar isActive={isActive} showLabels={true} />
                            )}
                        </SidebarMenu>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
