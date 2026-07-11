import type { AppRouterClient } from "@bmhkms/api/router";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import dotenv from "dotenv";
import { describe, expect, it } from "vitest";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });
dotenv.config({ path: new URL("../../.env", import.meta.url).pathname });

const { createApp } = await import("./app");
const { env } = await import("@bmhkms/env/server");

describe("createApp", () => {
  it("returns OK from the root health endpoint", async () => {
    const response = await createApp().handle(new Request("http://localhost/"));

    await expect(response.text()).resolves.toBe("OK");
    expect(response.status).toBe(200);
  });

  it("rejects unsupported authentication methods", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/api/auth/session", { method: "PUT" })
    );

    expect(response.status).toBe(405);
  });

  it("applies configured CORS credentials to allowed origins", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/", {
        headers: {
          Origin: env.WEB_URL,
        },
        method: "OPTIONS",
      })
    );

    expect(response.headers.get("access-control-allow-credentials")).toBe(
      "true"
    );
    expect(response.headers.get("access-control-allow-origin")).toBe(
      env.WEB_URL
    );
  });

  it("handles an RPC health request", async () => {
    const app = createApp();
    const link = new RPCLink({
      fetch: (input, init) => app.handle(new Request(input, init)),
      url: "http://localhost/rpc",
    });
    const client: AppRouterClient = createORPCClient(link);

    await expect(client.health.check()).resolves.toBe("OK");
  });

  it("serves the OpenAPI reference route", async () => {
    const response = await createApp().handle(
      new Request("http://localhost/api-reference")
    );

    expect(response.status).toBe(200);
  });

  it("returns not found for unknown RPC and API reference paths", async () => {
    const app = createApp();

    const rpcResponse = await app.handle(
      new Request("http://localhost/rpc/unknown")
    );
    const apiReferenceResponse = await app.handle(
      new Request("http://localhost/api-reference/unknown")
    );

    expect(rpcResponse.status).toBe(404);
    expect(apiReferenceResponse.status).toBe(404);
  });
});
