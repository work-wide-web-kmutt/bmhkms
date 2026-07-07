import { Link } from "@tanstack/react-router";
import { ChevronDownIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface StaffSidebarItem {
  activeRegex?: RegExp;
  icon: LucideIcon;
  label: string;
  to: string;
}

interface StaffSidebarStandardGroup {
  items: StaffSidebarItem[];
  label: string;
  type: "standard";
}

interface StaffSidebarCollapsibleGroup {
  defaultOpen?: boolean;
  items: StaffSidebarItem[];
  label: string;
  type: "collapsible";
}

type StaffSidebarGroup =
  | StaffSidebarStandardGroup
  | StaffSidebarCollapsibleGroup;

interface StaffSidebarGroupSectionProps {
  group: StaffSidebarGroup;
  pathname: string;
}

interface StaffSidebarGroupItemsProps {
  items: StaffSidebarItem[];
  pathname: string;
}

function StaffSidebarGroupItems({
  items,
  pathname,
}: StaffSidebarGroupItemsProps) {
  return (
    <>
      {items.map((item) => {
        const isActive =
          pathname === item.to || item.activeRegex?.test(pathname) === true;
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
    </>
  );
}

function StaffSidebarGroupSection({
  group,
  pathname,
}: StaffSidebarGroupSectionProps) {
  if (group.type === "collapsible") {
    return (
      <Collapsible
        className="group/collapsible"
        defaultOpen={group.defaultOpen ?? true}
      >
        <SidebarGroup>
          <SidebarGroupLabel
            render={
              <CollapsibleTrigger>
                {group.label}
                <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            }
          />
          <CollapsibleContent>
            <SidebarGroupContent>
              <StaffSidebarGroupItems items={group.items} pathname={pathname} />
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <StaffSidebarGroupItems items={group.items} pathname={pathname} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export type {
  StaffSidebarCollapsibleGroup,
  StaffSidebarGroup,
  StaffSidebarItem,
  StaffSidebarStandardGroup,
};
export { StaffSidebarGroupSection };
