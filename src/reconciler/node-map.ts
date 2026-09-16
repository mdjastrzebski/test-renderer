import type { Instance } from "./types";

/**
 * Maps public nodes handed to user code (`TestInstance`, scope instances) back to the host
 * instances they were created from.
 */
export const nodeToInstanceMap = new WeakMap<object, Instance>();
