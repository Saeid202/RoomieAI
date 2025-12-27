 
import { Home, Zap, Hammer, MessageSquare, User, Clock, MapPin, Settings } from "lucide-react";
import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface RenovatorSidebarProps {
    isActive: (path: string) => boolean;
    showLabels?: boolean;
}

export function RenovatorSidebar({ isActive, showLabels }: RenovatorSidebarProps) {
    return (
        <>
            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<Home size={18} />}
                label="Dashboard"
                to="/renovator/dashboard"
                isActive={isActive('/renovator/dashboard')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<Zap size={18} className="text-red-500" />}
                label="Emergency Inbox"
                to="/renovator/emergency"
                isActive={isActive('/renovator/emergency')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<Hammer size={18} />}
                label="Jobs"
                to="/renovator/jobs"
                isActive={isActive('/renovator/jobs')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<MessageSquare size={18} />}
                label="Messages"
                to="/renovator/messages"
                isActive={isActive('/renovator/messages')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<User size={18} />}
                label="Profile"
                to="/renovator/profile"
                isActive={isActive('/renovator/profile')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<Clock size={18} />}
                label="Availability"
                to="/renovator/availability"
                isActive={isActive('/renovator/availability')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<MapPin size={18} />}
                label="Service Area"
                to="/renovator/service-area"
                isActive={isActive('/renovator/service-area')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<Settings size={18} />}
                label="Settings"
                to="/renovator/settings"
                isActive={isActive('/renovator/settings')}
            />
        </>
    );
}
