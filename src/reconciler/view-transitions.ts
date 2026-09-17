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
 * There is nothing to animate in a test renderer, so every naming and measuring method is a no-op
 * and no transition is ever tracked: `startViewTransition` runs the commit phases inline and
 * reports back that nothing is running. This mirrors `react-test-renderer`.
 *
 * As a consequence the `onEnter` / `onExit` / `onUpdate` callbacks never fire: React only flushes
 * the queued view transition events when `startViewTransition` returns a running transition.
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

  hasInstanceChanged(
    _previousMeasurement: InstanceMeasurement,
    _nextMeasurement: InstanceMeasurement,
  ) {
    mark("reconciler/hasInstanceChanged");

    return false;
  },

  hasInstanceAffectedParent(
    _previousMeasurement: InstanceMeasurement,
    _nextMeasurement: InstanceMeasurement,
  ) {
    mark("reconciler/hasInstanceAffectedParent");

    return false;
  },

  startViewTransition(
    _suspendedState: SuspendedState,
    _rootContainer: Container,
    _transitionTypes: null | string[],
    flushMutationEffects: () => void,
    flushLayoutEffects: () => void,
    _flushAfterMutationEffects: () => void,
    flushSpawnedWork: () => void,
    _flushPassiveEffects: () => boolean,
    _reportError: (error: unknown) => void,
    _onSuspend: (reason: string) => void,
    _onFinish: () => void,
  ) {
    mark("reconciler/startViewTransition");

    flushMutationEffects();
    flushLayoutEffects();
    // Skip the "after mutation" phase: it only measures what would be animated.
    flushSpawnedWork();
    // Skip the passive effects: the spawned work schedules a task that flushes them.
    return null;
  },

  stopViewTransition(_viewTransition: ViewTransition) {
    mark("reconciler/stopViewTransition");
  },

  addViewTransitionFinishedListener(_viewTransition: ViewTransition, listener: () => void) {
    mark("reconciler/addViewTransitionFinishedListener");

    listener();
  },

  createViewTransitionInstance(_name: string) {
    mark("reconciler/createViewTransitionInstance");

    return null;
  },
} satisfies Partial<TestHostConfig>;
