import { createContext } from "@bmhkms/api/context";
import { appRouter } from "@bmhkms/api/router";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Elysia } from "elysia";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcRoutes = new Elysia({ name: "rpc-routes" }).all(
  "/rpc*",
  async ({ request }) => {
    const { response } = await rpcHandler.handle(request, {
      context: await createContext({ headers: request.headers }),
      prefix: "/rpc",
    });

    return response ?? new Response("Not Found", { status: 404 });
  },
  {
    parse: "none",
  }
);
