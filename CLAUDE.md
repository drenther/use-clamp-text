# use-clamp-text

React hook to clamp multiline text to a given height in a responsive way.

## Commands

- `pnpm run build` — build with tsdown
- `pnpm run test` — run tests with vitest
- `pnpm run test:coverage` — run tests with coverage
- `pnpm run typecheck` — type-check with tsc
- `pnpm run lint` — oxlint across the repo
- `pnpm run format` — oxfmt across the repo
- `pnpm run format:check` — check formatting

## Conventions

- TypeScript strict mode, target ES2022
- No single-character variable names — use descriptive names
- No nested ternaries
- Conventional Commits enforced via commitlint
- Exact pinned dependency versions (no `~`/`^`)
- oxlint for linting, oxfmt for formatting (no eslint/prettier)
- Vitest for testing with happy-dom environment

## Architecture

- `src/index.ts` — single-file hook implementation using binary search for optimal clamp point
- Zero runtime dependencies — all utilities (debounce, resize listener, mount/update effects) are built with native React hooks
- React is a peer dependency
- Dual CJS/ESM output via tsdown

## Supply Chain Config — Do Not Modify Without Approval

This repo enforces strict install-time supply chain defenses:

- Exact pinned versions (no `~`/`^`).
- `minimumReleaseAge` of 7 days (pnpm: minutes).
- Install/lifecycle scripts disabled by default; only packages in
  `onlyBuiltDependencies` (in `pnpm-workspace.yaml`) may run them.
- `blockExoticSubdeps: true`, `trustPolicy: no-downgrade` (in `pnpm-workspace.yaml`).

**Never disable, loosen, or bypass these settings** — including adding packages
to the script allow-list, shortening `minimumReleaseAge`, or setting
`dangerouslyAllowAllBuilds` — without explicit confirmation from the user in
the current conversation. A prior approval does not carry over.
