import { authClient } from "@bmhkms/client/auth-client";
import { orpc } from "@bmhkms/client/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const router = useRouter();

  const privateData = useQuery(orpc.privateData.queryOptions());

  async function signOut() {
    await authClient.signOut();
    router.navigate({ to: "/login" });
  }

  return (
    <div>
      <p>Welcome {session.data?.user.name}</p>
      <p>API: {privateData.data?.message}</p>
      <Button onClick={signOut} size="sm" variant="outline">
        Sign out
      </Button>
    </div>
  );
}
