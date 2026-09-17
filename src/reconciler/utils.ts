import { Tag } from "../constants";
import type { Container, Instance, TextInstance } from "./types";

/**
 * Maps public nodes handed to user code (`TestInstance`, scope instances) back to the host
 * instances they were created from.
 */
export const nodeToInstanceMap = new WeakMap<object, Instance>();

/**
 * Adds the child to the parent's list of children, moving it if it is already there.
 */
export function appendChildToParent(
  parentInstance: Container | Instance,
  child: Instance | TextInstance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }

  child.parent = parentInstance;
  parentInstance.children.push(child);
}

/**
 * Places the child before `beforeChild` in the parent's list of children.
 *
 * React uses this both for insertions and for reordering nodes, so the child is removed from its
 * current position first.
 */
export function insertBeforeChild(
  parentInstance: Container | Instance,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
): void {
  const index = parentInstance.children.indexOf(child);
  if (index !== -1) {
    parentInstance.children.splice(index, 1);
  }

  child.parent = parentInstance;
  const beforeIndex = parentInstance.children.indexOf(beforeChild);
  parentInstance.children.splice(beforeIndex, 0, child);
}

/**
 * Removes the child from the parent's list of children.
 *
 * React only calls this for the top-level node being removed; the rest of the subtree is left to
 * garbage collection.
 */
export function removeChildFromParent(
  parentInstance: Container | Instance,
  child: Instance | TextInstance,
): void {
  const index = parentInstance.children.indexOf(child);
  parentInstance.children.splice(index, 1);
  child.parent = null;
}

export function formatInstanceType(instance: Instance | TextInstance): string {
  return instance.tag === Tag.Text ? `text: "${instance.text}"` : instance.type;
}
