# Architecture

Key files:

- `src/index.ts` is the public entry point and exports `createRoot`.
- `src/renderer.ts` creates renderer roots and coordinates public rendering APIs.
- `src/reconciler.ts` defines the `react-reconciler` host config and tree updates.
- `src/test-instance.ts` defines `TestInstance`, the main wrapper around rendered host nodes.
- `src/to-json.ts` serializes rendered output into the snapshot-friendly JSON format.
- `src/query-all.ts` contains tree traversal helpers used for querying.
- `src/performance.ts` contains optional performance instrumentation.

When changing renderer behavior, start with `src/renderer.ts` and `src/reconciler.ts`.

When changing output shape or snapshot behavior, check `src/test-instance.ts` and `src/to-json.ts`.
