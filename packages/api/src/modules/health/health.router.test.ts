import { call } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { healthRouter } from "./health.router";

describe("healthRouter", () => {
  it("returns OK for anonymous requests", async () => {
    await expect(
      call(healthRouter.check, undefined, {
        context: { session: null },
      })
    ).resolves.toBe("OK");
  });
});
