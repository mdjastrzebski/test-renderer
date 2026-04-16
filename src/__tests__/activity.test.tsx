import { beforeEach, expect } from "@jest/globals";
import { Activity, useState } from "react";

import type { Props } from "../reconciler";
import { createRoot } from "../renderer";
import { testGateReact19_2 } from "../test-utils/react-version";
import { renderWithAct } from "../test-utils/render";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

const transformHiddenInstanceProps = ({ props }: { props: Props }) => ({
  ...props,
  "data-is-hidden": true,
});

testGateReact19_2("Activity hides content while preserving child state", async () => {
  let nextStateId = 0;

  function CounterPane() {
    const [stateId] = useState(() => ++nextStateId);
    return <div>Pane state: {stateId}</div>;
  }

  function App({ mode }: { mode: "hidden" | "visible" }) {
    return (
      <Activity mode={mode}>
        <CounterPane />
      </Activity>
    );
  }

  const renderer = createRoot();

  await renderWithAct(renderer, <App mode="visible" />);
  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Pane state: 
        1
      </div>
    </>
  `);

  await renderWithAct(renderer, <App mode="hidden" />);
  expect(renderer.container).toMatchInlineSnapshot(`< />`);

  await renderWithAct(renderer, <App mode="visible" />);
  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Pane state: 
        1
      </div>
    </>
  `);
});

testGateReact19_2(
  "Activity keeps hidden instances in output with transformHiddenInstanceProps",
  async () => {
    function Pane() {
      return <div>Content</div>;
    }

    function App({ mode }: { mode: "hidden" | "visible" }) {
      return (
        <Activity mode={mode}>
          <Pane />
        </Activity>
      );
    }

    const renderer = createRoot({ transformHiddenInstanceProps });

    await renderWithAct(renderer, <App mode="visible" />);
    expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Content
      </div>
    </>
  `);

    await renderWithAct(renderer, <App mode="hidden" />);
    expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div
        data-is-hidden={true}
      >
        Content
      </div>
    </>
  `);

    await renderWithAct(renderer, <App mode="visible" />);
    expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Content
      </div>
    </>
  `);
  },
);
