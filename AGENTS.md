# Test Renderer for React

`test-renderer` is a lightweight React 19 test renderer built on `react-reconciler`.

Use Bun for repository scripts.

Core commands:

- `bun run build`
- `bun run typecheck`
- `bun run test`
- `bun run validate`

Project docs:

- [Project Overview](./docs/agents/project-overview.md)
- [Architecture](./docs/agents/architecture.md)
- [Development Conventions](./docs/agents/development-conventions.md)
- [Commands](./docs/agents/commands.md)
- [Versioning](./docs/versioning.md)

PR draft workflow:

- Keep `PR.md` at the repository root aligned with the current branch diff relative to `origin/main`, using the structure from `.github/pull_request_template.md`.
- Do not commit or mention `PR.md` in the pull request description.

Release workflow:

- Always update `CHANGELOG.md` before cutting a release.
