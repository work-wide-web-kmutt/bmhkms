import { auth } from "@bmhkms/auth";
import { Elysia } from "elysia";

export const authRoutes = new Elysia({ name: "auth-routes" }).all(
  "/api/auth/*",
  ({ request, status }) => {
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }

    return status(405);
  }
);
