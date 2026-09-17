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
 * Host config methods driving fragment refs that are not part of the
 * `@types/react-reconciler` definitions yet.
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
 * Host config methods deciding whether a commit may be suspended for view transitions that are
 * not part of the `@types/react-reconciler` definitions yet.
 *
 * `<ViewTransition>` itself is not implemented by this renderer yet, but React >= 19.3 calls
 * `suspendOnActiveViewTransition` unconditionally during every commit, so it needs a stub
 * regardless of whether view transitions are used.
 */
type SuspenseHostConfigExtras = {
  maySuspendCommitOnUpdate: (type: Type, previousProps: Props, nextProps: Props) => boolean;
  maySuspendCommitInSyncRender: (type: Type, props: Props) => boolean;
  suspendOnActiveViewTransition: (suspendedState: SuspendedState, rootContainer: Container) => void;
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
  FragmentRefHostConfigExtras &
  SuspenseHostConfigExtras;
