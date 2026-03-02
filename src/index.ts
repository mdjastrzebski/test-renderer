export { createRoot } from "./renderer";

export type { Root, RootOptions } from "./renderer";

// eslint-disable-next-line @typescript-eslint/no-deprecated
export type { TestInstance, TestNode, HostElement } from "./test-instance";
export type { JsonElement, JsonNode } from "./to-json";
export type { QueryOptions } from "./query-all";

/**
 * React Fiber type from react-reconciler. Exported for advanced use cases only.
 * This type represents internal React structures that may change without warning.
 * Prefer using the stable TestInstance API instead.
 */
export type { Fiber } from "react-reconciler";
