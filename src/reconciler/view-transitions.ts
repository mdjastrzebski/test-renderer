import { mark } from "../performance";
import type {
  Container,
  Instance,
  InstanceMeasurement,
  Props,
  SuspendedState,
  TestHostConfig,
  ViewTransition,
} from "./types";

/**
 * Host config methods driving `<ViewTransition>`.
 *
 * There is nothing to measure or paint in a test renderer, so naming and measuring are no-ops:
 * `wasInstanceInViewport` is always `true` and `hasInstanceChanged` is always `true`, since there
 * is no real geometry to say otherwise. `startViewTransition` completes on a microtask instead of
 * waiting on a real animation, but it still goes through the real commit phases (including
 * `flushAfterMutationEffects`, which is what React uses to decide an instance changed) and
 * resolves the transition it returns, so `onEnter` / `onUpdate` / `onExit` fire the same way they
 * would for a real animation that finishes instantly.
 */
export const viewTransitionHostConfig = {
  applyViewTransitionName(_instance: Instance, _name: string, _className: string) {
    mark("reconciler/applyViewTransitionName");
  },

  restoreViewTransitionName(_instance: Instance, _props: Props) {
    mark("reconciler/restoreViewTransitionName");
  },

  cancelViewTransitionName(_instance: Instance, _name: string, _props: Props) {
    mark("reconciler/cancelViewTransitionName");
  },

  cancelRootViewTransitionName(_rootContainer: Container) {
    mark("reconciler/cancelRootViewTransitionName");
  },

  restoreRootViewTransitionName(_rootContainer: Container) {
    mark("reconciler/restoreRootViewTransitionName");
  },

  measureInstance(_instance: Instance) {
    mark("reconciler/measureInstance");

    return null;
  },

  measureClonedInstance(_instance: Instance) {
    mark("reconciler/measureClonedInstance");

    return null;
  },

  wasInstanceInViewport(_measurement: InstanceMeasurement) {
    mark("reconciler/wasInstanceInViewport");

    return true;
  },

  /**
   * There is no real geometry to diff, so any instance inside a subtree that React already
   * flagged as changed is treated as changed. Without this, `onUpdate` would never fire.
   */
  hasInstanceChanged(
    _previousMeasurement: InstanceMeasurement,
    _nextMeasurement: InstanceMeasurement,
  ) {
    mark("reconciler/hasInstanceChanged");

    return true;
  },

  hasInstanceAffectedParent(
    _previousMeasurement: InstanceMeasurement,
    _nextMeasurement: InstanceMeasurement,
  ) {
    mark("reconciler/hasInstanceAffectedParent");

    return false;
  },

  /**
   * #### `startViewTransition(...)`
   *
   * React calls this once per view-transition-eligible commit, handing over the callbacks that
   * drive the rest of the commit. Returning `null` here (as `react-test-renderer` does) makes
   * React skip queuing `onEnter` / `onUpdate` / `onExit` entirely, so this instead returns a
   * transition that completes on a microtask: real animations are asynchronous, so a synchronous
   * "instant" completion confuses React's own bookkeeping (it looks like a `flushSync` interrupted
   * a still-preparing transition). Flushing `flushAfterMutationEffects` is required too: that is
   * the phase where React measures instances and actually decides whether to fire `onEnter` /
   * `onUpdate`. `flushPassiveEffects` must also be called explicitly here: unlike a synchronous,
   * inline completion, deferring to a microtask means React's own follow-up scheduling no longer
   * flushes passive effects on its own. `_onSuspend` is unused: nothing here ever needs to load or
   * decode, so this renderer never has a reason to suspend a transition.
   */
  startViewTransition(
    _suspendedState: SuspendedState,
    _rootContainer: Container,
    _transitionTypes: null | string[],
    flushMutationEffects: () => void,
    flushLayoutEffects: () => void,
    flushAfterMutationEffects: () => void,
    flushSpawnedWork: () => void,
    flushPassiveEffects: () => boolean,
    reportError: (error: unknown) => void,
    _onSuspend: (reason: string) => void,
    onFinish: () => void,
  ): ViewTransition {
    mark("reconciler/startViewTransition");

    let resolveFinished!: () => void;
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    const transition: ViewTransition = { finished, resolveFinished, stopped: false };

    void Promise.resolve().then(() => {
      if (transition.stopped) {
        return;
      }

      try {
        flushMutationEffects();
        flushLayoutEffects();
        flushAfterMutationEffects();
        flushSpawnedWork();
        flushPassiveEffects();
      } catch (error) {
        reportError(error);
      } finally {
        onFinish();
        resolveFinished();
      }
    });

    return transition;
  },

  /**
   * Called by React when a later synchronous commit interrupts this transition before its
   * microtask has run: React flushes the commit itself in that case, so the microtask must skip
   * flushing again. `finished` still resolves so a listener registered via
   * `addViewTransitionFinishedListener` does not hang.
   */
  stopViewTransition(viewTransition: ViewTransition) {
    mark("reconciler/stopViewTransition");

    viewTransition.stopped = true;
    viewTransition.resolveFinished();
  },

  addViewTransitionFinishedListener(viewTransition: ViewTransition, listener: () => void) {
    mark("reconciler/addViewTransitionFinishedListener");

    void viewTransition.finished.then(listener);
  },

  createViewTransitionInstance(_name: string) {
    mark("reconciler/createViewTransitionInstance");

    return null;
  },
} satisfies Partial<TestHostConfig>;
