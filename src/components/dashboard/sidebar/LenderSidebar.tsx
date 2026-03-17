import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface LenderSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function LenderSidebar({ isActive, showLabels }: LenderSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">📊</span>}
        label="Dashboard"
        to="/dashboard/lender"
        isActive={isActive('/dashboard/lender')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👤</span>}
        label="Profile"
        to="/dashboard/lender/profile"
        isActive={isActive('/dashboard/lender/profile')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">💰</span>}
        label="Rates"
        to="/dashboard/lender/rates"
        isActive={isActive('/dashboard/lender/rates')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">📋</span>}
        label="Requests"
        to="/dashboard/lender/requests"
        isActive={isActive('/dashboard/lender/requests')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">💬</span>}
        label="Messenger"
        to="/dashboard/chats"
        isActive={isActive('/dashboard/chats')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">⚙️</span>}
        label="Settings"
        to="/dashboard/settings"
        isActive={isActive('/dashboard/settings')}
      />
    </>
  );
}