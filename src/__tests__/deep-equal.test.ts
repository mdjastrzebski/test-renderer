import { describe, expect, test } from "@jest/globals";

import { deepEqual } from "../reconciler/utils";

describe("deepEqual", () => {
  test("compares primitives", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual("a", "b")).toBe(false);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(NaN, NaN)).toBe(true);
    expect(deepEqual(0, -0)).toBe(false);
  });

  test("treats any two functions as equal", () => {
    expect(
      deepEqual(
        () => 1,
        () => 2,
      ),
    ).toBe(true);
    expect(deepEqual(() => 1, "not a function")).toBe(false);
  });

  test("compares arrays element-wise, order-sensitive", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [1, 3, 2])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([], [])).toBe(true);
    expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  test("compares plain objects regardless of key order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  test("compares nested structures recursively", () => {
    expect(deepEqual({ a: [1, { b: "x" }] }, { a: [1, { b: "x" }] })).toBe(true);
    expect(deepEqual({ a: [1, { b: "x" }] }, { a: [1, { b: "y" }] })).toBe(false);
  });

  test("ignores function identity inside nested structures", () => {
    expect(deepEqual({ onClick: () => 1, label: "A" }, { onClick: () => 2, label: "A" })).toBe(
      true,
    );
    expect(deepEqual({ onClick: () => 1, label: "A" }, { onClick: () => 2, label: "B" })).toBe(
      false,
    );
  });
});
