import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface MortgageBrokerSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function MortgageBrokerSidebar({ isActive, showLabels }: MortgageBrokerSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏠</span>}
        label="Dashboard"
        to="/dashboard/mortgage-broker"
        isActive={isActive('/dashboard/mortgage-broker')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👤</span>}
        label="Profile"
        to="/dashboard/mortgage-broker/profile"
        isActive={isActive('/dashboard/mortgage-broker/profile')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👥</span>}
        label="Clients"
        to="/dashboard/mortgage-broker/clients"
        isActive={isActive('/dashboard/mortgage-broker/clients')}
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
