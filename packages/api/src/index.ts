import { auth } from "@bmhkms/auth";
import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      headers: context.headers,
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export function requirePermissions(permissions: Record<string, string[]>) {
  return o.middleware(async ({ context, next }) => {
    const result = await auth.api.userHasPermission({
      body: {
        permissions,
      },
      headers: context.headers,
    });

    if (!result.success) {
      throw new ORPCError("FORBIDDEN");
    }

    return next();
  });
}
