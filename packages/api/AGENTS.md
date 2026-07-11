# API Architecture

These rules apply to `packages/api`. The package follows a feature-oriented modular-monolith structure inspired by NestJS, while remaining framework-light and based on oRPC.

## Package responsibility

- Own API contracts, oRPC routers and procedures, authorization middleware, validation schemas, application use cases, business rules, and feature-specific persistence operations.
- Organize backend code by business feature under `src/modules/<feature>/`.
- Keep the application router in `src/router.ts`.
- Keep shared procedure definitions in `src/procedures.ts`.
- Keep API context types and construction in `src/context.ts`.

## Feature structure

Use this layout as the default for a feature:

```text
src/modules/<feature>/
  <feature>.router.ts
  <feature>.schemas.ts
  <operation>.ts
  <feature>.repository.ts
  *.test.ts
```

Only create files justified by the feature's complexity. Do not create empty services, repositories, interfaces, or generic abstractions merely to match the layout.

## Layer boundaries

Keep this dependency flow:

```text
router → use case/service → repository/query → @bmhkms/db
```

- Routers validate input, enforce authentication and authorization, invoke use cases, and map expected failures.
- Routers must not contain substantial business logic or direct database queries.
- Business code must not depend on Elysia request or context types.
- API context may accept standard Web API values such as `Headers`, but must not accept framework-specific contexts.
- Use oRPC middleware for public, authenticated, and role-authorized procedures.
- Keep authentication (identity) separate from authorization (permissions).

## Business operations

- Prefer operation-named use cases such as `create-contestant.ts` when a feature has meaningful rules.
- A small cohesive feature may use `<feature>.service.ts`; split it when unrelated operations accumulate.
- Add a repository only for reusable persistence behavior, complex queries, transaction support, or test substitution.
- Do not wrap every Drizzle operation with a pass-through repository.
- The use case coordinating an atomic operation owns its Drizzle transaction boundary.
- Domain and application failures must not depend directly on Elysia.
- Define expected oRPC errors explicitly. Never expose sensitive values through oRPC error data.

## Dependencies and exports

- Import workspace packages through their package names; never use cross-package relative filesystem paths.
- Declare every runtime import in `packages/api/package.json`.
- Expose only deliberate public entry points through explicit package export subpaths.
- Do not use wildcard exports to expose internal module files.
- Avoid broad barrel files and circular dependencies.
- Prefer explicit context or factory dependencies over global mutable dependencies when practical.

## Testing

- Co-locate feature tests with the feature.
- Test business rules at the use-case level.
- Test routers for validation, authentication, authorization, and error mapping.
- Add database integration tests for meaningful Drizzle queries and transaction behavior.
- Cover unauthorized, forbidden, invalid-input, not-found, conflict, success, and rollback paths where applicable.
