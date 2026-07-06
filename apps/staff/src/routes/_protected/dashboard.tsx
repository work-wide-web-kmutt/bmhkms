import { authClient } from "@bmhkms/client/auth-client";
import { orpc } from "@bmhkms/client/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const router = useRouter();

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
        <Card className="rounded-lg border p-4">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <h1 className="text-2xl">Welcome {session.data?.user.name}</h1>
              <Button onClick={signOut} size="sm" variant="outline">
                Sign out
              </Button>
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between"></div>
            <h2 className="mb-2 font-medium">API Status</h2>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm text-muted-foreground">
                {getStatusText()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
