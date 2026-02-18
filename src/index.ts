export { createRoot } from "./renderer";

export type { Root, RootOptions } from "./renderer";
export type { TestElement, TestElementProps, TestNode } from "./test-element";
export type { JsonElement, JsonNode } from "./to-json";
export type { QueryOptions } from "./query-all";

/**
 * React Fiber type from react-reconciler. Exported for advanced use cases only.
 * This type represents internal React structures that may change without warning.
 * Prefer using the stable TestElement API instead.
 */
export type { Fiber } from "react-reconciler";
