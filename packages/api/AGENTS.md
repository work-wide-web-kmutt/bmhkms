# API Package Conventions

- This package owns the shared oRPC contract used by both `apps/server` and `apps/web`.
- Keep transport-specific code out of this package. No Elysia app bootstrap here.
- Put procedure primitives in `src/base.ts`.
- Put auth-related middleware in `src/modules/auth/`.
- Organize routers by feature under `src/modules/*/router.ts`.
- Compose the exported `appRouter` in `src/router.ts`.
- Keep imports inside this package relative unless there is a clear package boundary reason not to.
