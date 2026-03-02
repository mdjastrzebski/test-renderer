import type { TestInstance } from "./test-instance";

/**
 * Options for querying elements in the rendered tree.
 */
export interface QueryOptions {
  /** Include the instance itself in the results if it matches the predicate. Defaults to false. */
  includeSelf?: boolean;

  /** Exclude any ancestors of deepest matched instances even if they match the predicate. Defaults to false. */
  matchDeepestOnly?: boolean;
}

/**
 * Find all descendant elements matching the predicate.
 *
 * @param instance - Root TestInstance to search from.
 * @param predicate - Function that returns true for matching elements.
 * @param options - Optional query configuration.
 * @returns Array of matching elements in tree order.
 */
export function queryAll(
  instance: TestInstance,
  predicate: (instance: TestInstance) => boolean,
  options?: QueryOptions,
): TestInstance[] {
  const includeSelf = options?.includeSelf ?? false;
  const matchDeepestOnly = options?.matchDeepestOnly ?? false;

  const results: TestInstance[] = [];

  // Match descendants first but do not add them to results yet.
  const matchingDescendants: TestInstance[] = [];

  instance.children.forEach((child) => {
    if (typeof child === "string") {
      return;
    }

    matchingDescendants.push(...queryAll(child, predicate, { ...options, includeSelf: true }));
  });

  if (
    includeSelf &&
    // When matchDeepestOnly = true: add current element only if no descendants match
    (matchingDescendants.length === 0 || !matchDeepestOnly) &&
    predicate(instance)
  ) {
    results.push(instance);
  }

  // Add matching descendants after element to preserve original tree walk order.
  results.push(...matchingDescendants);

  return results;
}
