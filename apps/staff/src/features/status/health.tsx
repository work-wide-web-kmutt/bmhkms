import { orpc } from "@bmhkms/client/orpc";
import { useQuery } from "@tanstack/react-query";

function HealthStatus() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  function getStatusText() {
    if (healthCheck.isLoading) {
      return "Checking...";
    }
    return healthCheck.data ? "Connected" : "Disconnected";
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
      />
      <span className="text-sm text-muted-foreground">{getStatusText()}</span>
    </div>
  );
}

export { HealthStatus };
