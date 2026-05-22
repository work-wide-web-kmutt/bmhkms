# Server Conventions

- Keep `src/index.ts` limited to Elysia bootstrap, middleware registration, and route mounting.
- Put Better Auth wiring in `src/auth/`.
- Put oRPC transport glue in `src/rpc/`.
- Do not move shared API contracts into `apps/server`; those belong in `packages/api`.
- When adding endpoints, prefer extending `packages/api` routers first, then mount them here through the existing handlers.
