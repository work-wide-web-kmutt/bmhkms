import { authClient } from "@bmhkms/client/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: "/login",
      });
    }
    return { session };
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
