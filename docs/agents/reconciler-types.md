# Reconciler Types

`TestHostConfig` (`src/reconciler/types.ts`) is built on `@types/react-reconciler`. Known departures from it:

## Missing from the types

- Fragment refs and `<ViewTransition>` host methods (React 19.3 / reconciler 0.34) are patched in via
  `FragmentRefHostConfigExtras` and `ViewTransitionHostConfigExtras`. Remove them once the types add them.

## Types vs runtime

- `createContainer` is typed with an 11th `transitionCallbacks` argument that the 0.34 runtime doesn't take.
  We pass `null`.
- `rendererPackageName`, `rendererVersion` and `extraDevToolsConfig` are required by the types but only
  read by `injectIntoDevTools`, which we never call. They are stubs.

## Deliberate casts

- `HostTransitionContext` (`misc.ts`) sets `Provider` / `Consumer` to `null`, which the (correct,
  non-null) `ReactContext` type rejects. React's own renderers do the same (`null as any` in
  `ReactFiberConfigDOM.js`); the reconciler never reads these fields.
- `createContainer` returns `OpaqueRoot`, typed as `any`, hence the `no-unsafe-assignment` suppression
  in `renderer.ts`.

## Adding a new case

Check `references/react` first: the Flow types and `ReactFiberConfigDOM.js`. If the types are wrong, fix
them upstream in DefinitelyTyped. If React itself works around it, do the same and list it here.
