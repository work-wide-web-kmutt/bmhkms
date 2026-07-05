import { orpc } from "@bmhkms/client/orpc";
import { useQuery } from "@tanstack/react-query";
import * as reactRouter from "@tanstack/react-router";

export const Route = reactRouter.createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  function getStatusText() {
    if (healthCheck.isLoading) {
      return "Checking...";
    }
    return healthCheck.data ? "Connected" : "Disconnected";
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {getStatusText()}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
