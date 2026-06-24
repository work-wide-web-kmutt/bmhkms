import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_SERVER_URL: z.url(),
  },
  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,
  // oxlint-disable-next-line typescript/no-explicit-any
  runtimeEnv: (import.meta as any).env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
