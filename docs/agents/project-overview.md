# Project Overview

`test-renderer` is a lightweight, JavaScript-only replacement for the deprecated `react-test-renderer`.

It is built on `react-reconciler` and produces a traversable object tree based on `TestInstance`, so tests can inspect rendered output without a DOM or native runtime.

Relevant source layout:

- `src/` contains the implementation.
- `src/__tests__/` contains unit tests.
- `src/test-utils/` contains helpers used by project tests.
- `dist/` contains generated build output.

## Reference sources

Read-only git submodules for cross-validating renderer behavior against real code instead of assumptions. Populate with `git submodule update --init <path>` if empty.

- `references/react/` — upstream React (`react/react`); authoritative source for React and `react-reconciler` internals.
- `references/react-native-testing-library/` — upstream RNTL (`callstack/react-native-testing-library`); example of a real consumer building testing utilities on a renderer.
