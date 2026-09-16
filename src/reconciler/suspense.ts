import { mark } from "../performance";
import type { Props, SuspendedState, TestHostConfig, Type } from "./types";

/**
 * Host config methods deciding whether a commit needs to be suspended while host components
 * finish loading. Nothing loads in a test renderer, so no commit is ever suspended.
 */
export const suspenseHostConfig: Pick<
  TestHostConfig,
  | "maySuspendCommit"
  | "preloadInstance"
  | "startSuspendingCommit"
  | "suspendInstance"
  | "waitForCommitToBeReady"
> = {
  /**
   * #### `maySuspendCommit(type, props)`
   *
   * This method is called during render to determine if the Host Component type and props require
   * some kind of loading process to complete before committing an update.
   */
  maySuspendCommit(type: Type, _props: Props): boolean {
    mark("reconciler/maySuspendCommit", { type });

    return false;
  },

  /**
   * #### `preloadInstance(type, props)`
   *
   * This method may be called during render if the Host Component type and props might suspend a commit.
   * It can be used to initiate any work that might shorten the duration of a suspended commit.
   */
  preloadInstance(type: Type, _props: Props): boolean {
    mark("reconciler/preloadInstance", { type });

    return true;
  },

  /**
   * #### `startSuspendingCommit()`
   *
   * This method is called just before the commit phase. Use it to set up any necessary state while any Host
   * Components that might suspend this commit are evaluated to determine if the commit must be suspended.
   */
  startSuspendingCommit() {
    mark("reconciler/startSuspendingCommit");
  },

  /**
   * #### `suspendInstance(type, props)`
   *
   * This method is called after `startSuspendingCommit` for each Host Component that indicated it might
   * suspend a commit.
   */
  suspendInstance(type: Type, _props: Props) {
    mark("reconciler/suspendInstance", { type });
  },

  /**
   * #### `waitForCommitToBeReady(state, timeoutOffset)`
   *
   * This method is called after all `suspendInstance` calls are complete.
   *
   * Return `null` if the commit can happen immediately.
   * Return `(initiateCommit: Function) => Function` if the commit must be suspended. The argument to this
   * callback will initiate the commit when called. The return value is a cancellation function that the
   * Reconciler can use to abort the commit.
   */
  waitForCommitToBeReady(_state?: SuspendedState, _timeoutOffset?: number) {
    mark("reconciler/waitForCommitToBeReady");

    return null;
  },
};
