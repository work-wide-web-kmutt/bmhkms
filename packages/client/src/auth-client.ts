import { env } from "@bmhkms/env/web";
import { adminClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  ac,
  admin,
  contestant,
  observer,
  records_staff,
  root,
  staff,
} from "./permission";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    usernameClient(),
    adminClient({
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
});
