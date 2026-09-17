import ReactReconciler from "react-reconciler";

import { coreHostConfig } from "./core";
import { miscHostConfig } from "./misc";
import { mutationHostConfig } from "./mutation";
import { schedulingHostConfig } from "./scheduling";
import { suspenseHostConfig } from "./suspense";
import type { TestHostConfig } from "./types";

const hostConfig: TestHostConfig = {
  ...coreHostConfig,
  ...mutationHostConfig,
  ...schedulingHostConfig,
  ...suspenseHostConfig,
  ...miscHostConfig,
};

export const TestReconciler = ReactReconciler(hostConfig);

export type {
  ChildSet,
  Container,
  FormInstance,
  HostContext,
  HydratableInstance,
  Instance,
  NoTimeout,
  Props,
  PublicInstance,
  ReconcilerConfig,
  SuspendedState,
  SuspenseInstance,
  TestHostConfig,
  TextInstance,
  TimeoutHandle,
  TransformHiddenInstanceProps,
  TransitionStatus,
  Type,
} from "./types";
