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
- `utils.ts` holds the low-level tree helpers (`appendChildToParent`, `insertBeforeChild`,
  `removeChildFromParent`, `formatInstanceType`) and `nodeToInstanceMap`, the public-node registry
  used by `core.ts`.
- `core.ts` covers renderer flags, commit lifecycle hooks, node/scope lookups, and the render-phase
  methods for instance creation, host context and public instances.
- `mutation.ts` covers commit-phase tree mutations, updates and hiding/unhiding.
- `scheduling.ts` covers update priorities, event metadata, timeouts and microtasks.
- `suspense.ts` covers suspending a commit, including the view-transition-eligibility stubs React
  calls unconditionally regardless of whether `<ViewTransition>` is used.
- `misc.ts` covers the host transition context and the form/post-paint callbacks that don't fall
  under any of the above and have no behavior in a test renderer.
- `fragment-refs.ts` covers fragment refs (React >= 19.3).
- `view-transitions.ts` covers `<ViewTransition>` (React >= 19.3). There is nothing to paint, so
  naming is a no-op and `wasInstanceInViewport` is always `true`. There is no real geometry to
  measure either, so `measureInstance` snapshots an instance's rendered content instead (via
  `instanceToJson`), and `hasInstanceChanged` compares two such snapshots rather than bounding
  boxes. Unlike `react-test-renderer`, `startViewTransition` returns a real running transition that completes on
  a microtask instead of an animation, so `onEnter` / `onUpdate` / `onExit` fire like they would
  for an animation that finishes instantly. A later synchronous commit can still interrupt it
  (`stopViewTransition`), in which case it resolves without re-flushing a commit React already
  flushed itself.

When changing renderer behavior, start with `src/renderer.ts` and the relevant `src/reconciler/` slice.

When changing output shape or snapshot behavior, check `src/test-instance.ts` and `src/to-json.ts`.
