import { authClient } from "@bmhkms/client/auth-client";
import { roleNames } from "@bmhkms/client/permissions";
import type { RoleName } from "@bmhkms/client/permissions";
import { getRouteApi, useRouterState } from "@tanstack/react-router";
import { LayoutDashboardIcon, UserCogIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { StaffSidebarGroupSection } from "@/features/staff-sidebar/sidebar-group";
import type {
  StaffSidebarGroup,
  StaffSidebarPermissions,
} from "@/features/staff-sidebar/sidebar-group";
import UserDropdown from "@/features/user/dropdown";

const protectedRouteApi = getRouteApi("/_protected");

function isRoleName(role: string): role is RoleName {
  return roleNames.includes(role as RoleName);
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
    type: "standard",
  },
  {
    defaultOpen: true,
    items: [
      {
        activeRegex: /^\/admin\/staff(?:\/.*)?$/u,
        icon: UserCogIcon,
        label: "Staff Directory",
        permissions: {
          user: ["list"],
        },
        to: "/admin/staff",
      },
    ],
    label: "Admin",
    type: "collapsible",
  },
];

function canAccessSidebarItem(
  role: RoleName | undefined,
  permissions?: StaffSidebarPermissions
): boolean {
  if (!permissions) {
    return true;
  }

  if (!role) {
    return false;
  }

  return authClient.admin.checkRolePermission({
    permissions,
    role,
  });
}

function StaffSidebar() {
  const { session } = protectedRouteApi.useRouteContext();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const sessionRole = session.data?.user.role;
  const role =
    typeof sessionRole === "string" && isRoleName(sessionRole)
      ? sessionRole
      : undefined;
  const visibleSidebarGroups = staffSidebarGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessSidebarItem(role, item.permissions)
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <UserDropdown />
      </SidebarHeader>
      <SidebarContent>
        {visibleSidebarGroups.map((group) => (
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
