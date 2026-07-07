import { createDb } from "@bmhkms/db";
import * as schema from "@bmhkms/db/schema/auth";
import { env } from "@bmhkms/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, admin as adminPlugin } from "better-auth/plugins";

import {
  admin,
  ac,
  contestant,
  observer,
  records_staff,
  root,
  staff,
} from "./permission";

export { permissionStatements, roleDefinitions, roleNames } from "./roles";
export type { RoleName } from "./roles";

export function createAuth() {
  const db = createDb();
  const trustedOrigins = [env.WEB_URL, env.STAFF_URL];

  return betterAuth({
    advanced: {
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      },
    },
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",

      schema,
    }),
    emailAndPassword: {
      disableSignUp: true,
      enabled: true,
    },
    plugins: [
      username(),
      adminPlugin({
        ac,
        roles: {
          admin,
          contestant,
          observer,
          records_staff,
          root,
          staff,
        },
      }),
    ],
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      microsoft: {
        clientId: env.MICROSOFT_CLIENT_ID,
        clientSecret: env.MICROSOFT_CLIENT_SECRET,
        prompt: "select_account",
        tenantId: env.MICROSOFT_TENANT_ID,
      },
    },
    trustedOrigins,
  });
}

export const auth = createAuth();
