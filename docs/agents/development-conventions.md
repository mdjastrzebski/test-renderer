# Development Conventions

- Use strict TypeScript.
- Tests live in `src/__tests__/`.
- Project tests use `jest` with `ts-jest`.
- Linting uses ESLint.
- Formatting uses `oxfmt` through package scripts.
- Avoid adding unnecessary comments.

## Testing

- Test that Test Renderer is implemented correctly, not how React or `react-reconciler` behave. A
  test earns its place if it fails when our code (host config, renderer API, queries, JSON output)
  is wrong.
- Assert on what users see: the rendered tree, query results, JSON output, thrown errors, and
  callbacks reaching user code.
- Don't test React's own decisions, such as which host config methods it calls or when, how it
  batches or interrupts updates, or when it skips a view transition.
- Avoid setups that depend on React's internal scheduling, such as microtask ordering between
  commit phases. Only the performance tests should assert on performance marks.
- If host config behavior can't be reached reliably through public React APIs, call the host
  config method directly in a unit test.
- Before keeping a new test, break the code it covers and check that the test fails.
