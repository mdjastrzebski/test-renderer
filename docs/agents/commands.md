# Commands

Use Bun to run repository scripts.

- `bun run build` builds the package with `tsup` into `dist/`.
- `bun run dev` runs the build in watch mode.
- `bun run typecheck` runs `tsc --noEmit`.
- `bun run test` runs the Jest test suite.
- `bun run test:ci` runs tests with coverage.
- `bun run lint` runs ESLint.
- `bun run prettier` checks formatting.
- `bun run prettier:fix` writes formatting changes.
- `bun run validate` runs typecheck, test, lint, and formatting checks.
- `bun run validate:fix` runs formatting and lint fixes, then typecheck and tests.
