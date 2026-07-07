import * as reactRouter from "@tanstack/react-router";

export const Route = reactRouter.createFileRoute("/_protected/admin/staff")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="container px-4 py-2"></div>;
}
