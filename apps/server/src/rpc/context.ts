import type { Context as ORPCContext } from "@bmhkms/api/context";
import type { Context as ElysiaContext } from "elysia";

import { auth } from "../auth";

export interface CreateContextOptions {
  context: ElysiaContext;
}

export async function createContext({
  context,
}: CreateContextOptions): Promise<ORPCContext> {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  return {
    auth: null,
    session,
  };
}
