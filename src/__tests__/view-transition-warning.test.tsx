import { beforeEach, expect } from "@jest/globals";
import * as React from "react";

import { createRoot } from "../renderer";
import { testGateReact19_3 } from "../test-utils/react-version";
import { act, renderWithAct } from "../test-utils/render";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

// This lives in its own file on purpose. React only ever logs the "flushSync update cancelled a
// View Transition" warning once per module instance, and Jest gives each test file a fresh module
// registry but not each test. Alongside the other view transition tests, an earlier one would
// consume the warning and this assertion would pass no matter what.
testGateReact19_3("ViewTransition does not leak into the next commit", async () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(String(args[0]));
  };

  let setLabel: React.Dispatch<React.SetStateAction<string>> | undefined;

  function App() {
    const [label, setState] = React.useState("A");
    setLabel = setState;

    return (
      <React.ViewTransition name="leaky-box">
        <div>{label}</div>
      </React.ViewTransition>
    );
  }

  try {
    const renderer = createRoot();
    await renderWithAct(renderer, <App />);

    await act(() => {
      React.startTransition(() => setLabel?.("B"));
    });
    // Leaving the transition pending made this plain update report that a flushSync update had
    // cancelled a view transition that was still preparing.
    await act(() => {
      setLabel?.("C");
    });

    expect(warnings).toEqual([]);
  } finally {
    console.warn = originalWarn;
  }
});
