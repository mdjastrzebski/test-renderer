import type ReactReconciler from "react-reconciler";

import { mark } from "../performance";
import { REACT_CONTEXT_TYPE } from "../test-utils/react-constants";
import type { Instance, TestHostConfig, TransitionStatus } from "./types";

/**
 * Host config members with no `@types/react-reconciler` "Core Methods" home: host transition
 * plumbing and post-paint/form callbacks that have no behavior in a test renderer.
 */
export const miscHostConfig = {
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

  /**
   * #### `bindToConsole(methodName, args, badgeName)`
   *
   * Binds a `console` call so React can invoke it later, e.g. when logging an error replayed from a
   * Server Component. The environment badge is omitted, as there is no DevTools console to style it.
   */
  bindToConsole(methodName: string, args: unknown[], _badgeName: string) {
    mark("reconciler/bindToConsole", { methodName });

    const method = console[methodName as keyof Console] as (...args: unknown[]) => void;
    return method.bind(console, ...args);
  },
} satisfies Partial<TestHostConfig>;
