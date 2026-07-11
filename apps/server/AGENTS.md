# Server Architecture

These rules apply to `apps/server`. The server is the executable composition root and HTTP adapter; it does not own business behavior.

## Application responsibility

- Own Elysia creation, process startup, CORS, logging, framework plugins, Better Auth HTTP routes, oRPC/OpenAPI handlers, and conversion from Elysia requests to framework-neutral API context input.
- Do not own business rules, domain use cases, or feature persistence queries.

## Required structure

Use this target layout:

```text
src/
  main.ts
  app.ts
  plugins/
    cors.ts
    logging.ts
  routes/
    auth.ts
    rpc.ts
    openapi.ts
```

- `main.ts` only starts the application and handles startup-level concerns.
- `app.ts` creates and composes the Elysia application.
- Each plugin or route module exports one focused Elysia plugin or registration unit.
- Shared lifecycle hooks must declare their intended Elysia scope explicitly.
- Keep plugin registration order visible in `app.ts`.

## Boundary rules

- Pass standard request data such as `request.headers` into API context construction.
- Do not pass the complete Elysia context into `packages/api`.
- Delegate RPC behavior to the router exported by `@bmhkms/api`.
- Delegate authentication endpoints to `@bmhkms/auth`.
- Keep server error interception focused on logging, correlation, and transport-level response handling.
- Do not duplicate authorization or business validation owned by API procedures.
- Declare only dependencies directly imported by the server.
- Do not depend on `@bmhkms/db` unless the server composition root directly constructs or supplies a database dependency.

## Operational safety

- Do not log secrets, cookies, authorization headers, or unmasked personal data.
- Preserve CORS credentials behavior and explicit allowed origins.
- Preserve `parse: "none"` for oRPC/OpenAPI handlers when their handlers consume the raw request body.
- Keep startup configuration explicit and sourced from validated environment variables.
- Construct the Elysia app separately from listening so it can be tested without opening a port.

## Testing

- Test `createApp()` without starting a listener.
- Verify root health, auth routing, RPC routing, OpenAPI routing, CORS behavior, unsupported methods, and fallback responses.
- Verify that plugin scope and registration order apply middleware to the intended routes.
- Keep feature and business assertions in `packages/api`, not server integration tests.
