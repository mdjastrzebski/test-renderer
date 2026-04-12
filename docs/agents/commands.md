# Commands

Use Bun to run repository scripts.

- `bun run build` builds the package with `tsup` into `dist/`.
- `bun run dev` runs the build in watch mode.
- `bun run typecheck` runs `tsc --noEmit`.
- `bun run test` runs the Jest test suite.
- `bun run test:ci` runs tests with coverage.
- `bun run lint` runs ESLint.
- `bun run format` checks formatting with `oxfmt`.
- `bun run format:fix` writes formatting changes with `oxfmt`.
- `bun run validate` runs typecheck, test, lint, and formatting checks.
- `bun run validate:fix` runs formatting and lint fixes, then typecheck and tests.
