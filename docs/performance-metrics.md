# Performance Metrics

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
