# Reconciler Types

`TestHostConfig` (`src/reconciler/types.ts`) is built on `@types/react-reconciler`. Known quirks:

## Types vs runtime

- `createContainer` takes an 11th `transitionCallbacks` argument in React's source, and the types follow it.
  The 0.34 build drops it because transition tracing is off. We pass `null`.
- `rendererPackageName`, `rendererVersion` and `extraDevToolsConfig` are required by the types but only
  read by `injectIntoDevTools`, which we never call. They are stubs.
- `getInstanceFromNode`, `beforeActiveInstanceBlur`, `afterActiveInstanceBlur`, `prepareScopeUpdate` and
  `getInstanceFromScope` (`core.ts`), and `requestPostPaintCallback` (`misc.ts`), are required by React's
  host config contract (the core section of `ReactFiberConfig.custom.js`), and the types match it. The 0.34
  build never calls them: their feature flags are off, and `getInstanceFromNode` is only reached through
  the test selector API, which we don't enable (`supportsTestSelectors`). They are stubs and stay.

## Deliberate casts

- `HostTransitionContext` (`misc.ts`) sets `Provider` / `Consumer` to `null`, which the (correct,
  non-null) `ReactContext` / `ReactConsumerType` types reject. React's own renderers do the same
  (`null as any` in `ReactFiberConfigDOM.js`); the reconciler never reads these fields.
- `createContainer` returns `OpaqueRoot` (`FiberRoot`), typed as `any`, hence the `no-unsafe-assignment`
  suppression in `renderer.ts`.

## Adding a new case

Check `references/react` first, not the compiled `react-reconciler` bundle, which drops unused arguments
and unread host config methods. `packages/react-reconciler/src/forks/ReactFiberConfig.custom.js` says which
host config methods are required or optional, `packages/react-reconciler/src/ReactFiberReconciler.js` gives
the public signatures, and `ReactFiberConfigDOM.js` shows how React's own renderer handles a case. If the
types are wrong, fix them upstream in DefinitelyTyped. If React itself works around it, do the same and list
it here.
