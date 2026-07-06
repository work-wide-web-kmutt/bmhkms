import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function StaffSidebar() {
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>Bangmod Hackathon Management System</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
