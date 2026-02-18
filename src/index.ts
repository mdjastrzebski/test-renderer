export { createRoot } from "./renderer";

export type { Root, RootOptions } from "./renderer";
export type { TestInstance, TestInstanceProps, TestNode } from "./test-instance";
export type { JsonElement, JsonNode } from "./render-to-json";
export type { QueryOptions } from "./query-all";

/**
 * React Fiber type from react-reconciler. Exported for advanced use cases only.
 * This type represents internal React structures that may change without warning.
 * Prefer using the stable TestInstance API instead.
 */
export type { Fiber } from "react-reconciler";
