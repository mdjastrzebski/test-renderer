# Migration from React Test Renderer

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
