import * as reactRouter from "@tanstack/react-router";

export const Route = reactRouter.createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  return (
    <div className="container px-4 py-2">
      <h1 className="text-2xl">Welcome {session.data?.user.name}!</h1>
    </div>
  );
}
