import { createContext } from "@bmhkms/api/context";
import { appRouter } from "@bmhkms/api/router";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Elysia } from "elysia";

const openApiHandler = new OpenAPIHandler(appRouter, {
  interceptors: [
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    onError((error) => {
      console.error(error);
    }),
  ],
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
});

export const openApiRoutes = new Elysia({ name: "openapi-routes" }).all(
  "/api-reference*",
  async ({ request }) => {
    const { response } = await openApiHandler.handle(request, {
      context: await createContext({ headers: request.headers }),
      prefix: "/api-reference",
    });

    return response ?? new Response("Not Found", { status: 404 });
  },
  {
    parse: "none",
  }
);
