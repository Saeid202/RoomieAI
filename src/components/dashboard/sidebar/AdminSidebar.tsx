import {
  LayoutDashboard, Users, FileText, Hammer, Sparkles,
  Cog, Package, Truck, Building2, BarChart3, Shield, Wallet, Users2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isActive: (path: string) => boolean;
  showLabels?: boolean;
}

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Content & Users",
    items: [
      { label: "Pages", to: "/dashboard/admin/pages", icon: FileText },
      { label: "User Management", to: "/dashboard/admin/users", icon: Users },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Renovation Partners", to: "/dashboard/admin/renovation-partners", icon: Hammer },
      { label: "Cleaners", to: "/dashboard/admin/cleaners", icon: Sparkles },
    ],
  },
  {
    title: "Construction",
    items: [
      { label: "Products", to: "/dashboard/admin/construction", icon: Package },
      { label: "Suppliers", to: "/dashboard/admin/construction/suppliers", icon: Truck },
      { label: "Construction Page", to: "/dashboard/admin/construction/content", icon: Building2 },
    ],
  },
  {
    title: "Finance & Reports",
    items: [
      { label: "Rent Reporting", to: "/dashboard/admin/reporting", icon: BarChart3 },
      { label: "Rate Limits", to: "/dashboard/admin/rate-limits", icon: Shield },
      { label: "Admin Wallet", to: "/dashboard/admin/wallet", icon: Wallet },
      { label: "Communities", to: "/dashboard/admin/communities", icon: Users2 },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", to: "/dashboard/admin/settings", icon: Cog }],
  },
];

export function AdminSidebar({ isActive, showLabels }: AdminSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();
  const expanded = open || showLabels;

  const checkActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex flex-col gap-0.5 py-1">
      {/* Admin badge */}
      {expanded && (
        <div className="mb-4 mx-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-400 via-pink-500 to-violet-600 shadow-lg shadow-violet-200">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-black text-white tracking-widest uppercase">Admin Panel</span>
          </div>
        </div>
      )}

      {NAV_SECTIONS.map((section) => (
        <div key={section.title} className="mb-3">
          {expanded && (
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none">
              {section.title}
            </p>
          )}

          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = checkActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group",
                    active
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200"
                      : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-opacity",
                      active ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                    )}
                  />
                  {expanded && <span className="truncate">{item.label}</span>}
                  {active && expanded && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white/70 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {expanded && <div className="mt-3 border-b border-slate-100" />}
        </div>
      ))}
    </div>
  );
}
