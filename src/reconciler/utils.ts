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

/**
 * Structural equality.
 *
 * Two functions are always treated as equal: props routinely carry a fresh inline callback every
 * render, and callback identity is not part of an instance's rendered content.
 *
 * Written with plain loops rather than `Array.prototype.every`/arrow callbacks: this recurses
 * once per value in the compared trees, and avoiding a closure allocation per call matters at
 * that scale.
 */
export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (typeof left === "function" && typeof right === "function") {
    return true;
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);
  if (leftIsArray || rightIsArray) {
    if (!leftIsArray || !rightIsArray || left.length !== right.length) {
      return false;
    }

    for (let i = 0; i < left.length; i++) {
      if (!deepEqual(left[i], right[i])) {
        return false;
      }
    }

    return true;
  }

  if (typeof left !== "object" || typeof right !== "object" || left === null || right === null) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (
      !(key in right) ||
      !deepEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key])
    ) {
      return false;
    }
  }

  return true;
}
