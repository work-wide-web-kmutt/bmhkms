# Package Rules

These rules extend the repository root `AGENTS.md`.

## Better Auth Boundary

- `packages/client` is the frontend Better Auth client package.
- Do not import server-only Better Auth config from `packages/auth`.
- Do not couple this package to server env, database, secrets, server hooks, or server route setup.

## Better Auth Admin RBAC

- Better Auth admin custom access control is a documented exception.
- The Better Auth docs require passing custom `ac` and roles to both the server plugin and the client plugin.
- In this repo, keep the client-side copy in `packages/client/src/roles.ts` and `packages/client/src/permission.ts`.
- When changing admin RBAC in `packages/auth/src/roles.ts` or `packages/auth/src/permission.ts`, mirror the matching change here in the same change set.
- Mirror only the permission statements and role definitions needed by the Better Auth admin client plugin. Do not mirror unrelated auth setup.
