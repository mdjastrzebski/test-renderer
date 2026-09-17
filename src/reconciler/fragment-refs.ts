import type { Fiber } from "react-reconciler";

import { mark } from "../performance";
import type { FragmentInstance, Instance, TestHostConfig, TextInstance } from "./types";

/**
 * Host config methods backing React Fragment refs (React >= 19.3), which track the host children
 * currently rendered inside a fragment.
 */
export const fragmentRefHostConfig = {
  createFragmentInstance(fragmentFiber: Fiber) {
    mark("reconciler/createFragmentInstance");

    return { children: [], unstable_fiber: fragmentFiber };
  },

  updateFragmentInstanceFiber(fragmentFiber: Fiber, instance: FragmentInstance) {
    mark("reconciler/updateFragmentInstanceFiber");

    instance.unstable_fiber = fragmentFiber;
  },

  commitNewChildToFragmentInstance(
    child: Instance | TextInstance,
    fragmentInstance: FragmentInstance,
  ) {
    mark("reconciler/commitNewChildToFragmentInstance");

    if (!fragmentInstance.children.includes(child)) {
      fragmentInstance.children.push(child);
    }
  },

  deleteChildFromFragmentInstance(
    child: Instance | TextInstance,
    fragmentInstance: FragmentInstance,
  ) {
    mark("reconciler/deleteChildFromFragmentInstance");

    const index = fragmentInstance.children.indexOf(child);
    if (index !== -1) {
      fragmentInstance.children.splice(index, 1);
    }
  },
} satisfies Partial<TestHostConfig>;
