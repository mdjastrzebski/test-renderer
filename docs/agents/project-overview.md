# Project Overview

`test-renderer` is a lightweight, JavaScript-only replacement for the deprecated `react-test-renderer`.

It is built on `react-reconciler` and produces a traversable object tree based on `TestInstance`, so tests can inspect rendered output without a DOM or native runtime.

Relevant source layout:

- `src/` contains the implementation.
- `src/__tests__/` contains unit tests.
- `src/test-utils/` contains helpers used by project tests.
- `dist/` contains generated build output.
