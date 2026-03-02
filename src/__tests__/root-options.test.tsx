import { beforeEach, expect, jest, test } from "@jest/globals";
import { Component, Suspense, use, useEffect, useId } from "react";

import { createRoot } from "../renderer";
import { act, renderWithAct } from "../test-utils/render";
import type { JsonElement, JsonNode } from "../to-json";

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

test("isStrictMode option enables strict mode", async () => {
  let renderCount = 0;
  let effectCount = 0;

  function Counter() {
    renderCount++;
    useEffect(() => {
      effectCount++;
    }, []);
    return <div>Count: {renderCount}</div>;
  }

  const renderer = createRoot({ isStrictMode: true });
  await renderWithAct(renderer, <Counter />);

  // In strict mode, components render twice and effects run twice
  expect(renderCount).toBe(2);
  expect(effectCount).toBe(2);
});

test("identifierPrefix option prefixes useId values", async () => {
  let capturedId: string | undefined;

  function ComponentWithId() {
    capturedId = useId();
    return <div id={capturedId}>Content</div>;
  }

  const renderer = createRoot({ identifierPrefix: "test-prefix-" });
  await renderWithAct(renderer, <ComponentWithId />);

  expect(capturedId).toBeDefined();
  expect(capturedId).toContain("test-prefix-");
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

test("onCaughtError is called when error is caught by Error Boundary", async () => {
  const onCaughtError = jest.fn();

  function ThrowingComponent(): React.ReactNode {
    throw new Error("Test caught error");
  }

  const renderer = createRoot({ onCaughtError });
  await renderWithAct(
    renderer,
    <ErrorBoundary fallback={<div>Error caught</div>}>
      <ThrowingComponent />
    </ErrorBoundary>,
  );

  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Error caught
      </div>
    </>
  `);

  expect(onCaughtError).toHaveBeenCalledTimes(1);
  expect(onCaughtError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  expect((onCaughtError.mock.calls[0]?.[0] as Error).message).toBe("Test caught error");
});

test("transformHiddenInstanceProps keeps hidden instances in children and JSON output", async () => {
  let resolvePromise: (value: string) => void;
  const pendingPromise = new Promise<string>((resolve) => {
    resolvePromise = resolve;
  });

  function AsyncContent({ valuePromise }: { valuePromise: Promise<string> }) {
    const value = use(valuePromise);
    return (
      <div data-testid="content" style={{ opacity: 1 }}>
        Content: {value}
      </div>
    );
  }

  const renderer = createRoot({
    transformHiddenInstanceProps: ({ props, type }) => ({
      ...props,
      style: withHiddenStyle(props.style),
      "data-hidden-instance-type": type,
    }),
  });

  await renderWithAct(
    renderer,
    <Suspense fallback={<div data-testid="fallback">Loading...</div>}>
      <AsyncContent valuePromise={Promise.resolve("Visible")} />
    </Suspense>,
  );

  await renderWithAct(
    renderer,
    <Suspense fallback={<div data-testid="fallback">Loading...</div>}>
      <AsyncContent valuePromise={pendingPromise} />
    </Suspense>,
  );

  const contentInstances = renderer.container.queryAll(
    (instance) => instance.props["data-testid"] === "content",
  );
  expect(contentInstances).toHaveLength(1);
  expect(contentInstances[0]?.props.style).toEqual([{ opacity: 1 }, { display: "none" }]);
  expect(contentInstances[0]?.props["data-hidden-instance-type"]).toBe("div");

  const fallbackInstances = renderer.container.queryAll(
    (instance) => instance.props["data-testid"] === "fallback",
  );
  expect(fallbackInstances).toHaveLength(1);

  const json = renderer.container.toJSON();
  expect(json).not.toBeNull();
  expect(findJsonByTestId(json!, "content")).not.toBeNull();
  expect(findJsonByTestId(json!, "fallback")).not.toBeNull();

  await act(() => {
    resolvePromise!("Done");
  });
});

test("transformHiddenInstanceProps restores original props when instance becomes visible", async () => {
  let resolvePromise: (value: string) => void;
  const pendingPromise = new Promise<string>((resolve) => {
    resolvePromise = resolve;
  });

  function AsyncContent({ valuePromise }: { valuePromise: Promise<string> }) {
    const value = use(valuePromise);
    return (
      <div data-testid="content" style={{ opacity: 1 }}>
        Content: {value}
      </div>
    );
  }

  const renderer = createRoot({
    transformHiddenInstanceProps: ({ props, type }) => ({
      ...props,
      style: withHiddenStyle(props.style),
      "data-hidden-instance-type": type,
    }),
  });

  await renderWithAct(
    renderer,
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncContent valuePromise={Promise.resolve("Visible")} />
    </Suspense>,
  );

  await renderWithAct(
    renderer,
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncContent valuePromise={pendingPromise} />
    </Suspense>,
  );

  const hiddenContent = renderer.container.queryAll(
    (instance) => instance.props["data-testid"] === "content",
  );
  expect(hiddenContent).toHaveLength(1);
  expect(hiddenContent[0]?.props.style).toEqual([{ opacity: 1 }, { display: "none" }]);
  expect(hiddenContent[0]?.props["data-hidden-instance-type"]).toBe("div");

  await act(() => {
    resolvePromise!("Done");
  });

  const visibleContent = renderer.container.queryAll(
    (instance) => instance.props["data-testid"] === "content",
  );
  expect(visibleContent).toHaveLength(1);
  expect(visibleContent[0]?.props.style).toEqual({ opacity: 1 });
  expect(visibleContent[0]?.props["data-hidden-instance-type"]).toBeUndefined();
});

function withHiddenStyle(style: unknown): unknown[] {
  if (Array.isArray(style)) {
    return [...style, { display: "none" }];
  }

  if (style == null) {
    return [{ display: "none" }];
  }

  return [style, { display: "none" }];
}

function findJsonByTestId(node: JsonNode, testId: string): JsonElement | null {
  if (typeof node === "string") {
    return null;
  }

  if (node.props["data-testid"] === testId) {
    return node;
  }

  for (const child of node.children) {
    const match = findJsonByTestId(child, testId);
    if (match != null) {
      return match;
    }
  }

  return null;
}
