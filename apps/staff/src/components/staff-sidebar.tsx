import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function StaffSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
