# Project Overview

`test-renderer` is a lightweight, JavaScript-only replacement for the deprecated `react-test-renderer`.

It is built on `react-reconciler` and produces a traversable object tree based on `TestInstance`, so tests can inspect rendered output without a DOM or native runtime.

Relevant source layout:

- `src/` contains the implementation.
- `src/__tests__/` contains unit tests.
- `src/test-utils/` contains helpers used by project tests.
- `dist/` contains generated build output.

## React reference source

- `references/react/` is a git submodule pinned to the upstream React repository (`https://github.com/react/react.git`).
- Agents have read access to it as the authoritative source for React and `react-reconciler` internals.
- Use it to cross-validate renderer behavior against React itself — host-config contracts, reconciler semantics, lifecycle timing, and expected output shapes — rather than relying on assumptions.
- Populate it with `git submodule update --init references/react` if the directory is empty.
