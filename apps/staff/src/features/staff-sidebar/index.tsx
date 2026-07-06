import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboardIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserDropdown from "@/features/user/dropdown";

interface StaffSidebarItem {
  activeRegex?: RegExp;
  icon: LucideIcon;
  label: string;
  to: string;
}

interface StaffSidebarGroup {
  items: StaffSidebarItem[];
  label: string;
}

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
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.to ||
                  item.activeRegex?.test(pathname) === true;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<Link to={item.to} />}
                    >
                      <Icon />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export { StaffSidebar };
