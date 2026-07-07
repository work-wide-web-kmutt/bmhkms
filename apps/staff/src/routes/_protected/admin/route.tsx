import { authClient } from "@bmhkms/client/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin")({
  beforeLoad: async ({ context }) => {
    const session = context.session?.data;

    if (!session) {
      throw redirect({
        to: "/login",
      });
    }

    try {
      const { data, error } = await authClient.admin.hasPermission({
        permissions: {
          user: ["list"],
        },
      });

      if (error || !data.success) {
        throw redirect({
          to: "/dashboard",
        });
      }
    } catch {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
