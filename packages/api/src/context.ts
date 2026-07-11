import { auth } from "@bmhkms/auth";

export interface CreateContextOptions {
  headers: Headers;
}

export async function createContext({ headers }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers,
  });

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
