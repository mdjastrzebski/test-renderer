# Reconciler Types

`TestHostConfig` (`src/reconciler/types.ts`) is built on `@types/react-reconciler`. Known departures from it:

## Types vs runtime

- `createContainer` is typed with an 11th `transitionCallbacks` argument that the 0.34 runtime doesn't take.
  We pass `null`.
- `rendererPackageName`, `rendererVersion` and `extraDevToolsConfig` are required by the types but only
  read by `injectIntoDevTools`, which we never call. They are stubs.
- `getInstanceFromNode`, `beforeActiveInstanceBlur`, `afterActiveInstanceBlur`, `prepareScopeUpdate` and
  `getInstanceFromScope` (`core.ts`), and `requestPostPaintCallback` (`misc.ts`), are required by the
  types but dead at runtime. The 0.34 runtime reads them and never calls them, except
  `getInstanceFromNode`, which only the test selector API calls, and we don't set `supportsTestSelectors`.
  They are stubs. Delete them once the types mark them optional upstream.

## Deliberate casts

- `HostTransitionContext` (`misc.ts`) sets `Provider` / `Consumer` to `null`, which the (correct,
  non-null) `ReactContext` / `ReactConsumerType` types reject. React's own renderers do the same
  (`null as any` in `ReactFiberConfigDOM.js`); the reconciler never reads these fields.
- `createContainer` returns `OpaqueRoot` (`FiberRoot`), typed as `any`, hence the `no-unsafe-assignment`
  suppression in `renderer.ts`.

## Adding a new case

Check `references/react` first: the Flow types and `ReactFiberConfigDOM.js`. If the types are wrong, fix
them upstream in DefinitelyTyped. If React itself works around it, do the same and list it here.
