import { env } from "@bmhkms/env/web";
import { username, admin as adminPlugin } from "better-auth/plugins";
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

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: env.VITE_SERVER_URL,
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
  }
);
