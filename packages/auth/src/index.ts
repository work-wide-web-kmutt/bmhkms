import { createDb } from "@bmhkms/db";
import * as schema from "@bmhkms/db/schema/auth";
import { env } from "@bmhkms/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
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

const ALLOWED_EMAIL_DOMAIN = "@kmutt.ac.th";

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
    databaseHooks: {
      user: {
        create: {
          before: (user) => {
            if (!user.email?.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
              throw new APIError("FORBIDDEN", {
                message: `Only ${ALLOWED_EMAIL_DOMAIN} accounts are allowed`,
              });
            }
            return Promise.resolve({ data: user });
          },
        },
      },
    },
    emailAndPassword: {
      enabled: false,
    },
    plugins: [
      username(),
      adminPlugin({
        ac,
        admin,
        contestant,
        observer,
        records_staff,
        root,
        staff,
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
