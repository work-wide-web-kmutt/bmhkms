import { env } from "@bmhkms/env/server";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

export const corsPlugin = new Elysia({ name: "cors" }).use(
  cors({
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    origin: [env.WEB_URL, env.STAFF_URL],
  })
);
