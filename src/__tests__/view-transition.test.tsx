import { beforeEach, expect } from "@jest/globals";
import * as React from "react";

import { TestReconciler } from "../reconciler";
import { createRoot } from "../renderer";
import { testGateReact19_3 } from "../test-utils/react-version";
import { act, renderWithAct } from "../test-utils/render";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

testGateReact19_3("ViewTransition updates content inside startTransition", async () => {
  let setLabel: React.Dispatch<React.SetStateAction<string>> | undefined;

  function App() {
    const [label, setState] = React.useState("A");
    setLabel = setState;

    return (
      <React.ViewTransition>
        <div>{label}</div>
      </React.ViewTransition>
    );
  }

  const renderer = createRoot();

  await renderWithAct(renderer, <App />);
  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        A
      </div>
    </>
  `);

  await act(() => {
    React.startTransition(() => {
      setLabel?.("B");
    });
  });

  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        B
      </div>
    </>
  `);
});

testGateReact19_3("ViewTransition flushes passive effects", async () => {
  const effects: string[] = [];
  let setCount: React.Dispatch<React.SetStateAction<number>> | undefined;

  function App() {
    const [count, setState] = React.useState(0);
    setCount = setState;

    React.useEffect(() => {
      effects.push(`effect:${String(count)}`);
      return () => {
        effects.push(`cleanup:${String(count)}`);
      };
    }, [count]);

    return (
      <React.ViewTransition name="effects-box">
        <div>{count}</div>
      </React.ViewTransition>
    );
  }

  const renderer = createRoot();
  await renderWithAct(renderer, <App />);

  await act(() => {
    React.startTransition(() => setCount?.(1));
  });

  // The transition completes on a microtask rather than a real animation, but it must still
  // flush passive effects itself before finishing.
  expect(effects).toEqual(["effect:0", "cleanup:0", "effect:1"]);
});

testGateReact19_3("ViewTransition fires onEnter, onUpdate and onExit", async () => {
  const events: string[] = [];
  let setVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined;
  let setLabel: React.Dispatch<React.SetStateAction<string>> | undefined;

  function App() {
    const [visible, _setVisible] = React.useState(false);
    const [label, _setLabel] = React.useState("A");
    setVisible = _setVisible;
    setLabel = _setLabel;

    return (
      <div>
        {visible ? (
          <React.ViewTransition
            name="panel"
            onEnter={() => {
              events.push("enter");
            }}
            onExit={() => {
              events.push("exit");
            }}
            onUpdate={() => {
              events.push("update");
            }}
          >
            <div>{label}</div>
          </React.ViewTransition>
        ) : null}
      </div>
    );
  }

  const renderer = createRoot();
  await renderWithAct(renderer, <App />);
  expect(events).toEqual([]);

  await act(() => {
    React.startTransition(() => setVisible?.(true));
  });
  expect(events).toEqual(["enter"]);

  await act(() => {
    React.startTransition(() => setLabel?.("B"));
  });
  expect(events).toEqual(["enter", "update"]);

  await act(() => {
    React.startTransition(() => setVisible?.(false));
  });
  expect(events).toEqual(["enter", "update", "exit"]);
});

testGateReact19_3(
  "a synchronous update interrupting a pending transition still converges",
  async () => {
    let setLabel: React.Dispatch<React.SetStateAction<string>> | undefined;

    function App() {
      const [label, setState] = React.useState("A");
      setLabel = setState;

      return (
        <React.ViewTransition name="box">
          <div>{label}</div>
        </React.ViewTransition>
      );
    }

    const renderer = createRoot();
    await renderWithAct(renderer, <App />);

    await act(() => {
      React.startTransition(() => setLabel?.("B"));
      // Interrupts the pending transition before its microtask runs: React itself flushes this
      // commit synchronously and calls `stopViewTransition` on the one still in flight.
      TestReconciler.flushSyncFromReconciler(() => setLabel?.("C"));
    });

    expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        C
      </div>
    </>
  `);
  },
);
