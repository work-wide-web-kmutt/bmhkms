import { call, ORPCError } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { appRouter } from "./index";

const anonymousContext = { auth: null, session: null };

describe("appRouter", () => {
  it("healthCheck returns OK", async () => {
    await expect(
      call(appRouter.healthCheck, undefined, { context: anonymousContext })
    ).resolves.toBe("OK");
  });

  it("privateData rejects unauthenticated requests", async () => {
    const error = await call(appRouter.privateData, undefined, {
      context: anonymousContext,
    }).then(
      () => null,
      // oxlint-disable-next-line unicorn/catch-error-name
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: "UNAUTHORIZED" });
  });
});
