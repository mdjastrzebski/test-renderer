import ReactReconciler from "react-reconciler";

import { coreHostConfig } from "./core";
import { fragmentRefHostConfig } from "./fragment-refs";
import { miscHostConfig } from "./misc";
import { mutationHostConfig } from "./mutation";
import { schedulingHostConfig } from "./scheduling";
import { suspenseHostConfig } from "./suspense";
import type { TestHostConfig } from "./types";
import { viewTransitionHostConfig } from "./view-transitions";

const hostConfig: TestHostConfig = {
  ...coreHostConfig,
  ...mutationHostConfig,
  ...schedulingHostConfig,
  ...suspenseHostConfig,
  ...fragmentRefHostConfig,
  ...viewTransitionHostConfig,
  ...miscHostConfig,
};

export const TestReconciler = ReactReconciler(hostConfig);

export type {
  Container,
  Instance,
  Props,
  TextInstance,
  TransformHiddenInstanceProps,
} from "./types";
