import type { RouterClient } from "@orpc/server";

import { healthRouter } from "./modules/health/router";
import { privateRouter } from "./modules/private/router";

export const appRouter = {
  ...healthRouter,
  ...privateRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
