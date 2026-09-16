# Architecture

Key files:

- `src/index.ts` is the public entry point and exports `createRoot`.
- `src/renderer.ts` creates renderer roots and coordinates public rendering APIs.
- `src/reconciler/` defines the `react-reconciler` host config, split into functional slices.
- `src/test-instance.ts` defines `TestInstance`, the main wrapper around rendered host nodes.
- `src/to-json.ts` serializes rendered output into the snapshot-friendly JSON format.
- `src/query-all.ts` contains tree traversal helpers used for querying.
- `src/performance.ts` contains optional performance instrumentation.

## Host config slices

`src/reconciler/index.ts` composes the slices into a single host config and creates `TestReconciler`.
Each slice is checked with `satisfies Partial<TestHostConfig>`, so a misplaced or misspelled method
fails typecheck; a method missing across all slices is caught where `index.ts` assigns the composed
object to `TestHostConfig`.

- `types.ts` holds every host type, including `TestHostConfig` (the `@types/react-reconciler` config).
- `core.ts` covers renderer flags, commit lifecycle hooks, node/scope lookups, form plumbing, and the
  render-phase methods for instance creation, host context and public instances. It also owns
  `nodeToInstanceMap`, the public-node registry.
- `mutation.ts` covers commit-phase tree mutations, updates and hiding/unhiding.
- `scheduling.ts` covers update priorities, event metadata, timeouts and microtasks.
- `suspense.ts` covers suspending a commit.
- `instance-tree.ts` holds the low-level tree helpers (`appendChild`, `insertBefore`, `removeChild`)
  shared by `core.ts` and `mutation.ts`.

When changing renderer behavior, start with `src/renderer.ts` and the relevant `src/reconciler/` slice.

When changing output shape or snapshot behavior, check `src/test-instance.ts` and `src/to-json.ts`.
