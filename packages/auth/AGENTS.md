# Package Rules

These rules extend the repository root `AGENTS.md`.

## Better Auth Boundary

- `packages/auth` is the server-side Better Auth package.
- Do not mirror general Better Auth server configuration into client packages by default.
- Keep server-only concerns here: database adapters, env access, secrets, trusted origins, server hooks, and server API wiring.

## Better Auth Admin RBAC

- Better Auth admin custom access control is a special case.
- The Better Auth docs require passing custom `ac` and roles to both the server plugin and the client plugin.
- In this repo, the server copy lives in `packages/auth/src/roles.ts` and `packages/auth/src/permission.ts`.
- When changing admin RBAC shape here, make the matching update in `packages/client/src/roles.ts` and `packages/client/src/permission.ts` in the same change.
- Limit mirroring to the admin RBAC definitions the client plugin needs. Do not mirror unrelated server auth config.
