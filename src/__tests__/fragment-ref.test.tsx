import { beforeEach, expect } from "@jest/globals";
import * as React from "react";

import { createRoot } from "../renderer";
import { testGateReact19_3 } from "../test-utils/react-version";
import { act, renderWithAct, unmountWithAct } from "../test-utils/render";

// Smoke tests only: they check that fragment refs (React >= 19.3) do not crash the renderer.
// The behavior of fragment instances is not part of this contract.

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

testGateReact19_3("attaches and detaches a fragment ref", async () => {
  const ref = React.createRef<React.FragmentInstance>();

  const root = createRoot();
  await renderWithAct(
    root,
    <React.Fragment ref={ref}>
      <div>Hello</div>
    </React.Fragment>,
  );

  expect(ref.current).not.toBeNull();
  expect(root.container).toMatchInlineSnapshot(`
    <>
      <div>
        Hello
      </div>
    </>
  `);

  await unmountWithAct(root);
  expect(ref.current).toBeNull();
});

testGateReact19_3("survives updates to the fragment children", async () => {
  let setCount: React.Dispatch<React.SetStateAction<number>> | undefined;
  const ref = React.createRef<React.FragmentInstance>();

  function App() {
    const [count, setState] = React.useState(1);
    setCount = setState;

    return (
      <div>
        <React.Fragment ref={ref}>
          {Array.from({ length: count }, (_, index) => (
            <span key={index}>{index}</span>
          ))}
        </React.Fragment>
      </div>
    );
  }

  const root = createRoot();
  await renderWithAct(root, <App />);
  expect(ref.current).not.toBeNull();

  await act(() => {
    setCount?.(3);
  });
  expect(root.container).toMatchInlineSnapshot(`
    <>
      <div>
        <span>
          0
        </span>
        <span>
          1
        </span>
        <span>
          2
        </span>
      </div>
    </>
  `);

  await act(() => {
    setCount?.(0);
  });
  expect(root.container).toMatchInlineSnapshot(`
    <>
      <div />
    </>
  `);

  expect(ref.current).not.toBeNull();
});

testGateReact19_3("supports a callback fragment ref", async () => {
  const calls: string[] = [];

  function App({ visible }: { visible: boolean }) {
    return (
      <div>
        {visible ? (
          <React.Fragment
            ref={() => {
              calls.push("attach");
              return () => {
                calls.push("detach");
              };
            }}
          >
            <div>Content</div>
          </React.Fragment>
        ) : null}
      </div>
    );
  }

  const root = createRoot();
  await renderWithAct(root, <App visible />);
  expect(calls).toEqual(["attach"]);

  await renderWithAct(root, <App visible={false} />);
  expect(calls).toEqual(["attach", "detach"]);
});
