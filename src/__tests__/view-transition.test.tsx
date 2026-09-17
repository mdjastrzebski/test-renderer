import { beforeEach, expect } from "@jest/globals";
import * as React from "react";

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

  // Nothing may update the tree after the transition here: a later commit flushes whatever
  // passive effects are still pending and hides a transition that never flushed them itself.
  expect(effects).toEqual(["effect:0", "cleanup:0", "effect:1"]);
});

testGateReact19_3("ViewTransition does not fire animation callbacks", async () => {
  const events: string[] = [];
  let setVisible: React.Dispatch<React.SetStateAction<boolean>> | undefined;

  function App() {
    const [visible, setState] = React.useState(false);
    setVisible = setState;

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
            <div>panel</div>
          </React.ViewTransition>
        ) : null}
      </div>
    );
  }

  const renderer = createRoot();
  await renderWithAct(renderer, <App />);

  await act(() => {
    React.startTransition(() => setVisible?.(true));
  });
  await act(() => {
    React.startTransition(() => setVisible?.(false));
  });

  // There is nothing to animate in a test renderer, so no view transition is ever started and
  // React never flushes the queued view transition events.
  expect(events).toEqual([]);
});
