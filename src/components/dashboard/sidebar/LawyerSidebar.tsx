import { SidebarSimpleMenuItem } from "./SidebarSimpleMenuItem";

interface LawyerSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

export function LawyerSidebar({ isActive, showLabels }: LawyerSidebarProps) {
  return (
    <>
      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">🏠</span>}
        label="Dashboard"
        to="/dashboard/lawyer"
        isActive={isActive('/dashboard/lawyer')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👤</span>}
        label="Profile"
        to="/dashboard/lawyer/profile"
        isActive={isActive('/dashboard/lawyer/profile')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">👥</span>}
        label="Clients"
        to="/dashboard/lawyer/clients"
        isActive={isActive('/dashboard/lawyer/clients')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">📄</span>}
        label="Documents"
        to="/dashboard/lawyer/documents"
        isActive={isActive('/dashboard/lawyer/documents')}
      />

      <SidebarSimpleMenuItem
        showLabel={showLabels}
        icon={<span className="text-lg">⚖️</span>}
        label="Document Review Requests"
        to="/dashboard/lawyer-document-reviews"
        isActive={isActive('/dashboard/lawyer-document-reviews')}
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
