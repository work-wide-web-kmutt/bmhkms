import { authClient } from "@bmhkms/client/auth-client";
import { orpc } from "@bmhkms/client/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: HomeComponent,
});

function HomeComponent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  function getStatusText() {
    if (healthCheck.isLoading) {
      return "Checking...";
    }
    return healthCheck.data ? "Connected" : "Disconnected";
  }

  async function signOut() {
    await authClient.signOut();
    router.navigate({ to: "/login" });
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{session?.user.email}</span>
          <Button onClick={signOut} size="sm" variant="outline">
            Sign out
          </Button>
        </div>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">{getStatusText()}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
