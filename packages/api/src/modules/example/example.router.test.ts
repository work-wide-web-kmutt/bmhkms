import { call, ORPCError } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { exampleRouter } from "./example.router";

const anonymousContext = { session: null };
const authenticatedContext = {
  session: {
    session: {
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      id: "session-id",
      ipAddress: null,
      token: "token",
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
      userAgent: null,
      userId: "user-id",
    },
    user: {
      banned: false,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      email: "example@example.com",
      emailVerified: true,
      id: "user-id",
      image: null,
      name: "Example User",
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    },
  },
};

describe("exampleRouter", () => {
  it("rejects anonymous requests", async () => {
    const error = await call(exampleRouter.privateData, undefined, {
      context: anonymousContext,
    }).then(
      () => null,
      // oxlint-disable-next-line unicorn/catch-error-name
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns private data for authenticated requests", async () => {
    await expect(
      call(exampleRouter.privateData, undefined, {
        context: authenticatedContext,
      })
    ).resolves.toMatchObject({
      message: "This is private",
      user: {
        email: "example@example.com",
        id: "user-id",
      },
    });
  });
});
