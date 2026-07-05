import { authClient } from "@bmhkms/client/auth-client";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

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
      throw redirect({
        to: "/",
      });
    }

    return { session };
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
