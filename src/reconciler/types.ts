import type ReactReconciler from "react-reconciler";
import type { Fiber } from "react-reconciler";

import type { Tag } from "../constants";

export type Type = string;
export type Props = Record<string, unknown>;
export type TransformHiddenInstanceProps = (input: { props: Props; type: Type }) => Props;

export type ReconcilerConfig = {
  textComponentTypes?: string[];
  publicTextComponentTypes?: string[];
  transformHiddenInstanceProps?: TransformHiddenInstanceProps;
};

export type Container = {
  tag: typeof Tag.Container;
  parent: null;
  children: Array<Instance | TextInstance>;
  isHidden: false;
  config: ReconcilerConfig;
};

export type Instance = {
  tag: typeof Tag.Instance;
  type: string;
  props: Props;
  propsBeforeHiding: Props | null;
  children: Array<Instance | TextInstance>;
  parent: Container | Instance | null;
  rootContainer: Container;
  isHidden: boolean;
  unstable_fiber: Fiber;
};

export type FormInstance = Instance;

export type TextInstance = {
  tag: typeof Tag.Text;
  text: string;
  parent: Container | Instance | null;
  rootContainer: Container;
  isHidden: boolean;
};

export type SuspenseInstance = object;
export type SuspendedState = unknown;
export type HydratableInstance = object;
export type PublicInstance = object | null;
export type ChildSet = unknown;
export type TimeoutHandle = unknown;
export type NoTimeout = unknown;
export type TransitionStatus = unknown;

export type HostContext = {
  type: string;
  isInsideText: boolean;
  config: ReconcilerConfig;
};

/**
 * Host representation of a React Fragment ref (React >= 19.3).
 *
 * It tracks the host children currently rendered inside the fragment, so that fragment refs
 * can be observed in tests. The public API of DOM fragment instances (`focus`,
 * `addEventListener`, `getClientRects`, ...) is intentionally not implemented.
 */
export type FragmentInstance = {
  children: Array<Instance | TextInstance>;
  unstable_fiber: Fiber;
};

/**
 * The `*HostConfigExtras` types below (this one, `SuspenseHostConfigExtras`,
 * `ViewTransitionHostConfigExtras`) patch in host config methods for React >= 19.3 features that
 * are not part of the `@types/react-reconciler` definitions yet.
 */
type FragmentRefHostConfigExtras = {
  createFragmentInstance: (fragmentFiber: Fiber) => FragmentInstance;
  updateFragmentInstanceFiber: (fragmentFiber: Fiber, instance: FragmentInstance) => void;
  commitNewChildToFragmentInstance: (
    child: Instance | TextInstance,
    fragmentInstance: FragmentInstance,
  ) => void;
  deleteChildFromFragmentInstance: (
    child: Instance | TextInstance,
    fragmentInstance: FragmentInstance,
  ) => void;
};

/**
 * React >= 19.3 calls `suspendOnActiveViewTransition` unconditionally during every commit, so it
 * needs a stub regardless of whether `<ViewTransition>` is used.
 */
type SuspenseHostConfigExtras = {
  maySuspendCommitOnUpdate: (type: Type, previousProps: Props, nextProps: Props) => boolean;
  maySuspendCommitInSyncRender: (type: Type, props: Props) => boolean;
  suspendOnActiveViewTransition: (suspendedState: SuspendedState, rootContainer: Container) => void;
};

/**
 * There is nothing to measure in a test renderer, so instance measurements are represented by
 * `null`.
 */
export type InstanceMeasurement = null;

/**
 * A running `<ViewTransition>`.
 *
 * There is nothing to animate in a test renderer, so `startViewTransition` completes the
 * transition on a microtask instead of waiting on a real animation. `finished` is what
 * `addViewTransitionFinishedListener` observes; `stopped` lets `stopViewTransition` (called by
 * React when a later sync commit interrupts this transition) skip a flush React has already
 * performed itself, without leaving `finished` unresolved.
 */
export type ViewTransition = {
  finished: Promise<void>;
  resolveFinished: () => void;
  stopped: boolean;
};

export type ViewTransitionInstance = null;

type ViewTransitionHostConfigExtras = {
  applyViewTransitionName: (instance: Instance, name: string, className: string) => void;
  restoreViewTransitionName: (instance: Instance, props: Props) => void;
  cancelViewTransitionName: (instance: Instance, name: string, props: Props) => void;
  cancelRootViewTransitionName: (rootContainer: Container) => void;
  restoreRootViewTransitionName: (rootContainer: Container) => void;
  measureInstance: (instance: Instance) => InstanceMeasurement;
  measureClonedInstance: (instance: Instance) => InstanceMeasurement;
  wasInstanceInViewport: (measurement: InstanceMeasurement) => boolean;
  hasInstanceChanged: (
    previousMeasurement: InstanceMeasurement,
    nextMeasurement: InstanceMeasurement,
  ) => boolean;
  hasInstanceAffectedParent: (
    previousMeasurement: InstanceMeasurement,
    nextMeasurement: InstanceMeasurement,
  ) => boolean;
  startViewTransition: (
    suspendedState: SuspendedState,
    rootContainer: Container,
    transitionTypes: null | string[],
    flushMutationEffects: () => void,
    flushLayoutEffects: () => void,
    flushAfterMutationEffects: () => void,
    flushSpawnedWork: () => void,
    flushPassiveEffects: () => boolean,
    reportError: (error: unknown) => void,
    onSuspend: (reason: string) => void,
    onFinish: () => void,
  ) => ViewTransition;
  stopViewTransition: (viewTransition: ViewTransition) => void;
  addViewTransitionFinishedListener: (viewTransition: ViewTransition, listener: () => void) => void;
  createViewTransitionInstance: (name: string) => ViewTransitionInstance;
};

/**
 * Full host config implemented by this renderer.
 *
 * The implementation is split into functional slices (see the sibling modules), each typed as a
 * `Pick<TestHostConfig, ...>` and composed in `./index.ts`.
 */
export type TestHostConfig = ReactReconciler.HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  FormInstance,
  PublicInstance,
  HostContext,
  ChildSet,
  TimeoutHandle,
  NoTimeout,
  TransitionStatus
> &
  SuspenseHostConfigExtras &
  FragmentRefHostConfigExtras &
  ViewTransitionHostConfigExtras;
