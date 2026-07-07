import { useRouterState } from "@tanstack/react-router";
import { LayoutDashboardIcon, UserCogIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { StaffSidebarGroupSection } from "@/features/staff-sidebar/sidebar-group";
import type { StaffSidebarGroup } from "@/features/staff-sidebar/sidebar-group";
import UserDropdown from "@/features/user/dropdown";

const staffSidebarGroups: StaffSidebarGroup[] = [
  {
    items: [
      {
        activeRegex: /^\/dashboard(?:\/.*)?$/u,
        icon: LayoutDashboardIcon,
        label: "Dashboard",
        to: "/dashboard",
      },
    ],
    label: "Overview",
    type: "standard",
  },
  {
    defaultOpen: true,
    items: [
      {
        activeRegex: /^\/admin\/staff(?:\/.*)?$/u,
        icon: UserCogIcon,
        label: "Staff Directory",
        to: "/admin/staff",
      },
    ],
    label: "Admin",
    type: "collapsible",
  },
];

function StaffSidebar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <UserDropdown />
      </SidebarHeader>
      <SidebarContent>
        {staffSidebarGroups.map((group) => (
          <StaffSidebarGroupSection
            group={group}
            key={group.label}
            pathname={pathname}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export { StaffSidebar };
