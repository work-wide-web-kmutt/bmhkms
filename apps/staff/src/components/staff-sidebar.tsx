import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function StaffSidebar() {
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
