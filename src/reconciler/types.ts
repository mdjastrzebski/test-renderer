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
>;
