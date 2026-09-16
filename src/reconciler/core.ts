import type ReactReconciler from "react-reconciler";
import type { Fiber } from "react-reconciler";

import { mark, measureEnd, measureStart } from "../performance";
import { REACT_CONTEXT_TYPE } from "../test-utils/react-constants";
import { nodeToInstanceMap } from "./node-map";
import type { Container, Instance, TestHostConfig, TransitionStatus } from "./types";

/**
 * Renderer-wide host config: feature flags, commit lifecycle hooks, node lookups and the
 * form/transition plumbing that has no behavior in a test renderer.
 */
export const coreHostConfig = {
  /**
   * #### `isPrimaryRenderer`
   *
   * This is a property (not a function) that should be set to `true` if your renderer is the main one on the
   * page. For example, if you're writing a renderer for the Terminal, it makes sense to set it to `true`, but
   * if your renderer is used *on top of* React DOM or some other existing renderer, set it to `false`.
   */
  isPrimaryRenderer: true,

  /**
   * Whether the renderer shouldn't trigger missing `act()` warnings
   */
  warnsIfNotActing: true,

  // -------------------
  // Hydration Methods
  //    (optional)
  // You can optionally implement hydration to "attach" to the existing tree during the initial render instead
  // of creating it from scratch. For example, the DOM renderer uses this to attach to an HTML markup.
  //
  // To support hydration, you need to declare `supportsHydration: true` and then implement the methods in
  // the "Hydration" section [listed in this file](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/forks/ReactFiberHostConfig.custom.js).
  // File an issue if you need help.
  // -------------------
  supportsHydration: false,

  /**
   * #### `prepareForCommit(containerInfo)`
   *
   * This method lets you store some information before React starts making changes to the tree on
   * the screen. For example, the DOM renderer stores the current text selection so that it can later
   * restore it. This method is mirrored by `resetAfterCommit`.
   *
   * Even if you don't want to do anything here, you need to return `null` from it.
   */
  prepareForCommit(_containerInfo: Container) {
    mark("reconciler/prepareForCommit");
    measureStart("react/commit");

    return null; // noop
  },

  /**
   * #### `resetAfterCommit(containerInfo)`
   *
   * This method is called right after React has performed the tree mutations. You can use it to restore
   * something you've stored in `prepareForCommit` — for example, text selection.
   *
   * You can leave it empty.
   */
  resetAfterCommit(_containerInfo: Container): void {
    measureEnd("react/commit");
    mark("reconciler/resetAfterCommit");
  },

  /**
   * #### `preparePortalMount(containerInfo)`
   *
   * This method is called for a container that's used as a portal target. Usually you can leave it empty.
   */
  preparePortalMount(_containerInfo: Container): void {
    mark("reconciler/preparePortalMount");
  },

  getInstanceFromNode(node: object): Fiber | null | undefined {
    mark("reconciler/getInstanceFromNode");

    const instance = nodeToInstanceMap.get(node);
    if (instance !== undefined) {
      return instance.unstable_fiber;
    }

    return null;
  },

  beforeActiveInstanceBlur(): void {
    mark("reconciler/beforeActiveInstanceBlur");
  },

  afterActiveInstanceBlur(): void {
    mark("reconciler/afterActiveInstanceBlur");
  },

  prepareScopeUpdate(scopeInstance: object, instance: Instance): void {
    mark("reconciler/prepareScopeUpdate");

    nodeToInstanceMap.set(scopeInstance, instance);
  },

  getInstanceFromScope(scopeInstance: object): Instance | null {
    mark("reconciler/getInstanceFromScope");

    return nodeToInstanceMap.get(scopeInstance) ?? null;
  },

  detachDeletedInstance(_node: Instance): void {
    mark("reconciler/detachDeletedInstance");
  },

  NotPendingTransition: null,
  HostTransitionContext: {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null as unknown as ReactReconciler.ReactProviderType<TransitionStatus>,
    Consumer: null as unknown as ReactReconciler.ReactContext<TransitionStatus>,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0,
  } as ReactReconciler.ReactContext<TransitionStatus>,

  resetFormInstance(_form: Instance) {
    mark("reconciler/resetFormInstance");
  },

  requestPostPaintCallback(_callback: (endTime: number) => void) {
    mark("reconciler/requestPostPaintCallback");
  },
} satisfies Partial<TestHostConfig>;
