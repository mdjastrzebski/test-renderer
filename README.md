# Test Renderer for React

A lightweight test renderer for React and a modern replacement for the deprecated React Test Renderer.

This library is used by [React Native Testing Library](https://github.com/callstack/react-native-testing-library) but should work with any React variant.

It uses [React Reconciler](https://github.com/facebook/react/tree/main/packages/react-reconciler) to build a custom renderer that operates on host elements by default, and provides escape hatches for complex use-cases. Most React Reconciler options are exposed through `RootOptions`.

For release and compatibility policy, see [docs/versioning.md](./docs/versioning.md).

## Installation

```bash
yarn add -D test-renderer
```

## Getting Started

```tsx
import { createRoot } from "test-renderer";
import { act } from "react";

test("renders a component", async () => {
  const renderer = createRoot();

  // Use `act` in async mode to allow resolving all scheduled React updates
  await act(async () => {
    renderer.render(<div>Hello!</div>);
  });

  expect(renderer.container).toMatchInlineSnapshot(`
    <>
      <div>
        Hello!
      </div>
    </>
  `);
});
```

## React 19 Compatibility Lines

Starting with `1.x`, `test-renderer` tracks preferred React 19 compatibility lines while keeping a broad React 19 peer range so installs do not get blocked between React minor releases.

| `test-renderer` version | `react` version | `react-reconciler` version | Notable React features                                  |
| ----------------------- | --------------- | -------------------------- | ------------------------------------------------------- |
| `1.0.x`                 | `19.0`          | `~0.31.0`                  | Actions, `useActionState`, `useOptimistic`, `use`       |
| `1.1.x`                 | `19.1`          | `~0.32.0`                  | Owner Stack support, CSS-selector-safe `useId()` format |
| `1.2.x`                 | `19.2`          | `~0.33.0`                  | `<Activity />`, `useEffectEvent`                        |

These examples are illustrative, not exhaustive. The `1.0.x`, `1.1.x`, and `1.2.x` lines are current compatibility lines. New React-minor-specific support lands on the matching preferred React / `react-reconciler` line for each `1.x` release, even though the package publishes a broad React 19 peer range.

## Test Output Tree

Instead of producing a DOM tree or a native view hierarchy, the renderer builds an in-memory **Test Output Tree**:

- Composed of **`TestNode`s**, where each node is either:
  - A **`TestInstance`** — represents a host element such as `div` or `View`
  - A plain **`string`** — represents a text node
- The root is accessible via `root.container`, a `TestInstance` whose `type` is an empty string
- `TestInstance` nodes are traversable and queryable — see the [`TestInstance`](#testelement) API below

## JSON Output Tree

Calling `toJSON()` on a `TestInstance` produces a **JSON Output Tree** — a static, plain-object snapshot of the Test Output Tree at that point in time:

- Composed of **`JsonNode`s**, where each node is either:
  - A **`JsonElement`** — a plain object with `type`, `props`, and `children`
  - A plain **`string`** — a text node
- Contains no live references, making it safe to serialize
- Ideal for snapshot testing

## API Reference

### `createRoot(options?)`

Creates a new test renderer root instance.

**Parameters:**

- `options` (optional): Configuration options for the renderer. See [`RootOptions`](#rootoptions) below.

**Returns:** A `Root` object with the following properties:

- `render(element: ReactElement)`: Renders a React element into the root. Fragments are supported. Non-element root values such as strings or `null` are not supported. Must be called within `act()`.
- `unmount()`: Unmounts the root and cleans up. Must be called within `act()`.
- `container`: A `TestInstance` wrapper that contains the rendered element(s). Use this to query and inspect the rendered tree.

**Example:**

```tsx
const renderer = createRoot();
await act(async () => {
  renderer.render(<div>Hello!</div>);
});
```

### `RootOptions`

Configuration options for the test renderer. Many of these options correspond to React Reconciler configuration options. For detailed information about reconciler-specific options, refer to the [React Reconciler source code](https://github.com/facebook/react/tree/main/packages/react-reconciler).

| Option                         | Type                                                                                             | Description                                                                                                                                                                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `textComponentTypes`           | `string[]`                                                                                       | Types of host components that are allowed to contain text nodes. Trying to render text outside of these components will throw an error. Useful for simulating React Native's text rendering rules.                                                                                               |
| `publicTextComponentTypes`     | `string[]`                                                                                       | Host component types to display to users in error messages when they try to render text outside of `textComponentTypes`. Defaults to `textComponentTypes` if not provided.                                                                                                                       |
| `transformHiddenInstanceProps` | `({ props, type }: { props: Record<string, unknown>; type: string }) => Record<string, unknown>` | Transforms host instance props when React marks an instance as hidden (for example, while Suspense fallback is shown). Return a new props object instead of mutating the provided one. When provided, hidden instances stay visible in `children` and `toJSON()` output using transformed props. |
| `identifierPrefix`             | `string`                                                                                         | A string prefix React uses for IDs generated by `useId()`. Useful to avoid conflicts when using multiple roots.                                                                                                                                                                                  |
| `isStrictMode`                 | `boolean`                                                                                        | Enable React Strict Mode. When enabled, components render twice and effects run twice in development.                                                                                                                                                                                            |
| `onCaughtError`                | `(error: unknown, errorInfo: { componentStack?: string }) => void`                               | Callback called when React catches an error in an Error Boundary. Called with the error caught by the Error Boundary and an errorInfo object containing the component stack.                                                                                                                     |
| `onUncaughtError`              | `(error: unknown, errorInfo: { componentStack?: string }) => void`                               | Callback called when an error is thrown and not caught by an Error Boundary. Called with the error that was thrown and an errorInfo object containing the component stack.                                                                                                                       |
| `onRecoverableError`           | `(error: unknown, errorInfo: { componentStack?: string }) => void`                               | Callback called when React automatically recovers from errors. Called with an error React throws and an errorInfo object containing the component stack. Some recoverable errors may include the original error cause as `error.cause`.                                                          |

### `TestInstance` {#test-instance}

A wrapper around rendered host elements with a DOM-like API for querying and inspecting the rendered tree.

**Properties:**

- `type: string`: The element type (e.g., `"View"`, `"div"`). Returns an empty string for the container element.
- `props: Record<string, any>`: The element's props object.
- `children: TestNode[]`: Array of child nodes (elements and text strings). Hidden children are excluded by default, but are included when `transformHiddenInstanceProps` is configured.
- `parent: TestInstance | null`: The parent element, or `null` if this is the root container.
- `unstable_fiber: Fiber | null`: Access to the underlying React Fiber node. **Warning:** This is an unstable API that exposes internal React Reconciler structures which may change without warning in future React versions. Use with caution and only when absolutely necessary.

**Methods:**

- `toJSON(): JsonElement | null`: Converts this element to a JSON representation suitable for snapshots. Returns `null` for hidden elements only when `transformHiddenInstanceProps` is not configured.
- `queryAll(predicate: (instance: TestInstance) => boolean, options?: QueryOptions): TestInstance[]`: Finds all descendant elements matching the predicate. See [Query Options](#query-options) below.

**Example:**

```tsx
const renderer = createRoot();
await act(async () => {
  renderer.render(<div className="container">Hello</div>);
});

const root = renderer.container.children[0] as TestInstance;
expect(root.type).toBe("div");
expect(root.props.className).toBe("container");
expect(root.children).toContain("Hello");
```

### `QueryOptions`

Options for configuring element queries.

| Option             | Type      | Default | Description                                                                                                          |
| ------------------ | --------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `includeSelf`      | `boolean` | `false` | Include the element itself in the results if it matches the predicate.                                               |
| `matchDeepestOnly` | `boolean` | `false` | Exclude any ancestors of deepest matched elements even if they match the predicate. Only return the deepest matches. |

**Example:**

```tsx
// Find all divs, including nested ones
const allDivs = container.queryAll((el) => el.type === "div");

// Find only the deepest divs (exclude parent divs if they contain matching children)
const deepestDivs = container.queryAll((el) => el.type === "div", { matchDeepestOnly: true });

// Include the container itself if it matches
const includingSelf = container.queryAll((el) => el.type === "div", { includeSelf: true });
```

## Migration from React Test Renderer

This library replaces the deprecated React Test Renderer. The main differences:

- **Host element focus**: Operates on host components by default, while React Test Renderer worked with a mix of host and composite components. Access the underlying fiber via `unstable_fiber` if needed.
- **Built on React Reconciler**: Uses React Reconciler to implement a custom renderer.
- **Exposed reconciler options**: Most React Reconciler configuration options are available through `RootOptions`.

For most use cases, the migration is straightforward:

```tsx
// Before (React Test Renderer)
import TestRenderer from "react-test-renderer";
const tree = TestRenderer.create(<MyComponent />);

// After (Test Renderer)
import { createRoot } from "test-renderer";
const root = createRoot();
await act(async () => {
  root.render(<MyComponent />);
});
const tree = root.container;
```

## Performance Metrics

The library includes optional performance instrumentation using the [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance). All marks and measures are prefixed with `test-renderer/` for easy filtering.

```tsx
globalThis.TEST_RENDERER_ENABLE_PROFILING = true;

// Run your tests, then query metrics:
const marks = performance
  .getEntriesByType("mark")
  .filter((m) => m.name.startsWith("test-renderer/"));
const measures = performance
  .getEntriesByType("measure")
  .filter((m) => m.name.startsWith("test-renderer/"));
```

**Note:** The specific marks and measures emitted are unstable and may change between versions. Performance metrics are disabled by default.

## License

MIT
