import { env } from "@bmhkms/env/server";

import { createApp } from "./app";

createApp().listen(env.PORT, ({ hostname, port }) => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
