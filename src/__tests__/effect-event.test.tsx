import { beforeEach, expect } from "@jest/globals";
import { useEffect, useEffectEvent } from "react";

import { createRoot } from "../renderer";
import { testGateReact19_2 } from "../test-utils/react-version";
import { renderWithAct } from "../test-utils/render";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

testGateReact19_2(
  "useEffectEvent reads the latest value when an effect is triggered by another dependency",
  async () => {
    const observedValues: string[] = [];

    function Subscriber({ trigger, value }: { trigger: number; value: string }) {
      const onEffectEvent = useEffectEvent(() => {
        observedValues.push(value);
      });

      useEffect(() => {
        onEffectEvent();
      }, [trigger]);

      return <div>{value}</div>;
    }

    const renderer = createRoot();

    await renderWithAct(renderer, <Subscriber trigger={0} value="first" />);
    expect(observedValues).toEqual(["first"]);

    await renderWithAct(renderer, <Subscriber trigger={0} value="second" />);
    expect(observedValues).toEqual(["first"]);

    await renderWithAct(renderer, <Subscriber trigger={1} value="second" />);
    expect(observedValues).toEqual(["first", "second"]);
  },
);
