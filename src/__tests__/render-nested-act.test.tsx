import { beforeEach, describe, expect, test } from "@jest/globals";
import { createElement } from "react";

import { createRoot } from "../renderer";
import { act, renderWithAct, unmountWithAct } from "../test-utils/render";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

/**
 * Regression test: `render()` (and `unmount()`) must commit synchronously even
 * when React's module-level `actScopeDepth` is already above zero — i.e. when the
 * render runs inside what `act()` treats as a *nested* scope and therefore does
 * NOT flush its work queue.
 *
 * Why this matters in real suites: React's `act()` only flushes its internal work
 * queue when it is the OUTERMOST act (`prevActScopeDepth === 0`). A single
 * not-yet-settled `act()` call elsewhere in the run leaves `actScopeDepth`
 * elevated for every later `act()`. This happens routinely with
 * `@testing-library/react-native` v14: its `afterEach` auto-cleanup unmounts
 * inside `act()`, and many RN jest setups additionally wrap the global timers in
 * `act()` (to silence "not wrapped in act(...)" warnings). The net effect was that
 * only the FIRST test in a file rendered — every subsequent `render()`/
 * `renderHook()` committed an empty tree (`toJSON() === null`).
 *
 * Root cause: `render()` used `updateContainer` (a Default-lane update on a
 * ConcurrentRoot), which only commits when the outermost `act()` flushes its
 * queue. Rendering at Sync lane and flushing immediately makes the commit
 * independent of the ambient act scope — the same thing `react-test-renderer`
 * gets for free by rendering RN trees on a LegacyRoot (Sync lanes).
 */
describe("render/unmount commit synchronously regardless of the ambient act() scope", () => {
  const Probe = () => createElement("View", { testID: "root" }, createElement("Text", null, "hi"));

  const rootOptions = { textComponentTypes: ["Text"], publicTextComponentTypes: ["Text"] };

  // Three sequential renders on fresh roots, each performed while an OUTER act()
  // scope is still open (so the render's own act() is nested and never flushes).
  // Before the fix, only a render at the outermost scope committed, so these
  // assertions saw an empty tree.
  test.each(["first", "second", "third"])(
    "%s render inside a nested act() is visible immediately",
    async () => {
      await act(async () => {
        const root = createRoot(rootOptions);
        await renderWithAct(root, <Probe />);

        const json = root.container.toJSON();
        expect(json).not.toBeNull();
        expect(json?.children.length ?? 0).toBeGreaterThan(0);
      });
    },
  );

  test("unmount inside a nested act() actually tears the tree down", async () => {
    await act(async () => {
      const root = createRoot(rootOptions);
      await renderWithAct(root, <Probe />);
      expect(root.container.children.length).toBe(1);

      await unmountWithAct(root);
      // `unmount()` nulls the container, so accessing it must throw rather than
      // silently no-op — proving the unmount committed, not just got queued.
      expect(() => root.container).toThrow("Cannot access .container on unmounted test renderer");
    });
  });
});
