import { Elysia } from "elysia";
import type { AnyElysia } from "elysia";

import { corsPlugin } from "./plugins/cors";
import { loggingPlugin } from "./plugins/logging";
import { authRoutes } from "./routes/auth";
import { openApiRoutes } from "./routes/openapi";
import { rpcRoutes } from "./routes/rpc";

export function createApp(): AnyElysia {
  return new Elysia()
    .use(loggingPlugin)
    .use(corsPlugin)
    .use(authRoutes)
    .use(rpcRoutes)
    .use(openApiRoutes)
    .get("/", () => "OK");
}
