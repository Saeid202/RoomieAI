
import { Home, Zap, Hammer, MessageSquare, User, Clock, MapPin, Settings, Users, Building } from "lucide-react";
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
                icon={<span className="text-lg">🏠</span>}
                label="Dashboard"
                to="/renovator/dashboard"
                isActive={isActive('/renovator/dashboard')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">👤</span>}
                label="Profile"
                to="/renovator/profile"
                isActive={isActive('/renovator/profile')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">🌐</span>}
                label="My Public Page"
                to="/renovator/public-page"
                isActive={isActive('/renovator/public-page')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">🚨</span>}
                label="Emergency Inbox"
                to="/renovator/emergency"
                isActive={isActive('/renovator/emergency')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">🛠️</span>}
                label="Jobs"
                to="/renovator/jobs"
                isActive={isActive('/renovator/jobs')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">📅</span>}
                label="Availability"
                to="/renovator/availability"
                isActive={isActive('/renovator/availability')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">📍</span>}
                label="Service Area"
                to="/renovator/service-area"
                isActive={isActive('/renovator/service-area')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">💰</span>}
                label="Tax Intelligence"
                to="/renovator/tax-intelligence"
                isActive={isActive('/renovator/tax-intelligence')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">💬</span>}
                label="Messages"
                to="/renovator/messages"
                isActive={isActive('/renovator/messages')}
            />

            <SidebarSimpleMenuItem
                showLabel={showLabels}
                icon={<span className="text-lg">⚙️</span>}
                label="Settings"
                to="/renovator/settings"
                isActive={isActive('/renovator/settings')}
            />
        </>
    );
}
