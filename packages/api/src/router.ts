import type { RouterClient } from "@orpc/server";

import { exampleRouter } from "./modules/example/example.router";
import { healthRouter } from "./modules/health/health.router";

export const appRouter = {
  example: exampleRouter,
  health: healthRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
