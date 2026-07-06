import { authClient } from "@bmhkms/client/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { StaffSidebar } from "@/components/staff-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const KMUTT_EMAIL_DOMAIN = "@kmutt.ac.th";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }

    const userEmail = session.data.user.email.toLowerCase();
    if (!userEmail.endsWith(KMUTT_EMAIL_DOMAIN)) {
      await authClient.signOut();
      throw redirect({ search: { error: "domain_not_allowed" }, to: "/login" });
    }

    return { session };
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <SidebarProvider defaultOpen>
      <StaffSidebar />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <header className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
