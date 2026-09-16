import { DefaultEventPriority, NoEventPriority } from "react-reconciler/constants";

import { mark } from "../performance";
import type { TestHostConfig } from "./types";

let currentUpdatePriority: number = NoEventPriority;

/**
 * Host config methods for update priorities, event metadata and task scheduling.
 */
export const schedulingHostConfig = {
  setCurrentUpdatePriority(priority: number) {
    mark("reconciler/setCurrentUpdatePriority", { priority });

    currentUpdatePriority = priority;
  },

  getCurrentUpdatePriority() {
    return currentUpdatePriority;
  },

  resolveUpdatePriority(): number {
    const priority = currentUpdatePriority || DefaultEventPriority;
    mark("reconciler/resolveUpdatePriority", { priority });

    return priority;
  },

  trackSchedulerEvent() {
    mark("reconciler/trackSchedulerEvent");
  },

  resolveEventType(): null {
    mark("reconciler/resolveEventType");

    return null;
  },

  resolveEventTimeStamp(): number {
    const timestamp = -1.1;
    mark("reconciler/resolveEventTimeStamp", { timestamp });

    return timestamp;
  },

  shouldAttemptEagerTransition() {
    mark("reconciler/shouldAttemptEagerTransition", { result: false });

    return false;
  },

  /**
   * #### `scheduleTimeout(fn, delay)`
   *
   * You can proxy this to `setTimeout` or its equivalent in your environment.
   */
  scheduleTimeout(fn: () => void, delay: number): ReturnType<typeof setTimeout> {
    const id = setTimeout(() => {
      mark("reconciler/scheduled timeout:start");
      fn();
      mark("reconciler/scheduled timeout:end");
    }, delay);
    mark("reconciler/scheduleTimeout", { id });
    return id;
  },

  /**
   * #### `cancelTimeout(id)`
   *
   * You can proxy this to `clearTimeout` or its equivalent in your environment.
   */
  cancelTimeout(id: ReturnType<typeof setTimeout>): void {
    mark("reconciler/cancelTimeout", { id });

    clearTimeout(id);
  },

  /**
   * #### `noTimeout`
   *
   * This is a property (not a function) that should be set to something that can never be a valid timeout ID.
   * For example, you can set it to `-1`.
   */
  noTimeout: -1,

  /**
   * #### `supportsMicrotasks`
   *
   * Set this to `true` to indicate that your renderer supports `scheduleMicrotask`. We use microtasks as part
   * of our discrete event implementation in React DOM. If you're not sure if your renderer should support this,
   * you probably should. The option to not implement `scheduleMicrotask` exists so that platforms with more control
   * over user events, like React Native, can choose to use a different mechanism.
   */
  supportsMicrotasks: true,

  /**
   * #### `scheduleMicrotask(fn)`
   *
   * Optional. You can proxy this to `queueMicrotask` or its equivalent in your environment.
   */
  scheduleMicrotask(fn: () => void): ReturnType<typeof queueMicrotask> {
    mark("reconciler/scheduleMicrotask");

    queueMicrotask(() => {
      mark("reconciler/scheduled microtask:start");
      fn();
      mark("reconciler/scheduled microtask:end");
    });
  },
} satisfies Partial<TestHostConfig>;
