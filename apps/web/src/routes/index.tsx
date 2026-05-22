import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  let statusText = "Disconnected";

  if (healthCheck.isLoading) {
    statusText = "Checking...";
  } else if (healthCheck.data) {
    statusText = "Connected";
  }

  return (
    <div className="container p-4">
      <div className="flex gap-2 w-fit items-center">
        <div
          className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-muted-foreground text-sm">{statusText}</span>
      </div>
    </div>
  );
}
